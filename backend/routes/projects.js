import express from "express";
import cloudinary from "../config/cloudinaryConfig.js";
import Projects from "../models/projectSchema.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all projects, optionally filter by title
router.get("/", async (req, res) => {
  try {
    const projectTitle = req.query.title;

    if (projectTitle) {
      const titleResults = await Projects.find({
        title: { $regex: new RegExp(projectTitle, "i") },
      }).exec();

      if (titleResults.length > 0) {
        return res.status(200).json({
          projects: titleResults,
          message: "The following projects were found.",
        });
      } else {
        return res.status(404).json({ message: "Sorry, no projects found." });
      }
    }

    const projects = await Projects.find().exec();
    if (projects.length > 0) {
      return res.status(200).json({
        projects: projects,
        message: "The following projects exist.",
      });
    } else {
      return res.status(404).json({ message: "Sorry, no projects found." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message:
        "Sorry, this page is not available at the moment. Please try again later.",
    });
  }
});

// GET a single project by ID
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Projects.findById(projectId).exec();

    if (project) {
      return res.status(200).json({ project, message: "Project found." });
    } else {
      return res.status(404).json({
        message: "Sorry, no project found with that ID.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message:
        "Sorry, this page is not available at the moment. Please try again later.",
    });
  }
});

router.post(
  "/newProject",
  upload.fields([{ name: "images" }]),
  async (req, res) => {
    try {
      const {
        name,
        year,
        material,
        exhibited_at,
        category,
        description,
        short_description,
        size,
        video,
      } = req.body;

      const photographers = req.body.photographers
        ? JSON.parse(req.body.photographers)
        : [];

      // --- Bilder ---
      const imageFiles = req.files?.images || [];
      const imageUploads = await Promise.all(
        imageFiles.map(
          (file, i) =>
            new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream(
                  {
                    folder: "projekt",
                    resource_type: "image",
                    use_filename: true,
                    unique_filename: false,
                  },
                  (err, result) => {
                    if (err) return reject(err);
                    resolve({
                      url: result.secure_url,
                      public_id: result.public_id,
                      photographer: photographers[i] || "",
                    });
                  }
                )
                .end(file.buffer);
            })
        )
      );

      // --- Video (kommer från frontend som JSON-string) ---
      let videoUpload = null;
      if (video) {
        videoUpload = JSON.parse(video); // { url, public_id, photographer? }
      }

      await Projects.updateMany({}, { $inc: { order: 1 } });

      const newProject = new Projects({
        name,
        year,
        material,
        exhibited_at,
        category,
        description,
        short_description,
        size,
        images: imageUploads,
        video: videoUpload,
        order: 0,
      });

      await newProject.save();
      res
        .status(201)
        .json({ message: "Project created successfully", project: newProject });
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Error creating project" });
    }
  }
);

router.patch("/reorder", async (req, res) => {
  try {
    const updatedList = req.body; // array med { id, order }

    // 🔍 Validera att det är en array
    if (!Array.isArray(updatedList)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // ✅ Kontrollera att alla 'order' är unika
    const seen = new Set();
    for (let item of updatedList) {
      if (seen.has(item.order)) {
        return res.status(400).json({ message: "Duplicate order values" });
      }
      seen.add(item.order);
    }

    // 🔁 Kör bulkWrite för att uppdatera alla samtidigt
    const bulkOps = updatedList.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    await Projects.bulkWrite(bulkOps);

    res.json({ message: "Projects reordered successfully" });
  } catch (error) {
    console.error("Error reordering projects:", error);
    res.status(500).json({ message: "Error reordering projects" });
  }
}),
  router.patch(
    "/:id",
    upload.fields([{ name: "images" }]),
    async (req, res) => {
      try {
        const { id } = req.params;
        const {
          name,
          year,
          material,
          exhibited_at,
          category,
          description,
          short_description,
          removeVideo,
          size,
          video,
        } = req.body;

        const project = await Projects.findById(id);
        if (!project)
          return res.status(404).json({ message: "Project not found" });

        // --- Ta bort bilder ---
        let removeList = [];
        if (req.body.removeImages) {
          removeList = Array.isArray(req.body.removeImages)
            ? req.body.removeImages
            : [req.body.removeImages];
        }
        for (const public_id of removeList) {
          await cloudinary.uploader.destroy(public_id);
          project.images = project.images.filter(
            (img) => img.public_id !== public_id
          );
        }

        // --- Uppdatera fotografer ---
        if (req.body.imageData) {
          const imageData = JSON.parse(req.body.imageData);
          imageData
            .filter((d) => d.public_id)
            .forEach((d) => {
              const img = project.images.find(
                (i) => i.public_id === d.public_id
              );
              if (img) img.photographer = d.photographer;
            });
        }

        // --- Nya bilder ---
        // --- Uppdatera bilder (ordning, fotografer, nya, borttagna) ---
        if (req.body.imageData) {
          const imageData = JSON.parse(req.body.imageData);

          // 1️⃣ Ladda upp eventuella nya bilder först
          if (req.files?.images?.length) {
            for (let i = 0; i < req.files.images.length; i++) {
              const file = req.files.images[i];
              const uploaded = await new Promise((resolve, reject) => {
                cloudinary.uploader
                  .upload_stream(
                    {
                      folder: "projekt",
                      resource_type: "image",
                      use_filename: true,
                      unique_filename: false,
                    },
                    (err, result) => {
                      if (err) return reject(err);
                      resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        photographer: "",
                      });
                    }
                  )
                  .end(file.buffer);
              });
              // Ersätt rätt plats i imageData (om index är markerad), annars lägg till sist
              if (imageData[i] && !imageData[i].public_id) {
                imageData[i] = uploaded;
              } else {
                imageData.push(uploaded);
              }
            }
          }

          // 2️⃣ Uppdatera project.images med nya ordningen direkt
          project.images = imageData.map((img) => ({
            url: img.url,
            public_id: img.public_id,
            photographer: img.photographer || "",
          }));

          // 3️⃣ Säkerställ att Mongoose fattar att arrayen ändrats
          project.markModified("images");
        }

        // --- Video ---
        if (removeVideo === "true" && project.video) {
          project.video = undefined;
        }

        if (video) {
          // frontend skickar { url, public_id } som string
          const parsedVideo = JSON.parse(video);
          project.video = parsedVideo;
        }

        // --- Textfält ---
        if (name !== undefined) project.name = name;
        if (year !== undefined) project.year = year;
        if (material !== undefined) project.material = material;
        if (exhibited_at !== undefined) project.exhibited_at = exhibited_at;
        if (category !== undefined) project.category = category;
        if (description !== undefined) project.description = description;
        if (short_description !== undefined)
          project.short_description = short_description;
        if (size !== undefined) project.size = size;

        await project.save();
        res.json({ message: "Project updated successfully", project });
      } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Error updating project" });
      }
    }
  ),
  // DELETE a project by ID
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await Projects.findById(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // 🖼 Ta bort alla bilder från Cloudinary
      for (const img of project.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      await Projects.updateMany(
        { order: { $gt: project.order } },
        { $inc: { order: -1 } }
      );
      await project.deleteOne();

      res.json({ message: "Project deleted successfully", id });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Error deleting project" });
    }
  });

export default router;
