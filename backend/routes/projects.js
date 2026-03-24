import express from "express";
import cloudinary from "../config/cloudinaryConfig.js";
import Projects from "../models/projectSchema.js";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

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

      const imageData = req.body.imageData
        ? JSON.parse(req.body.imageData)
        : [];

      const imageFiles = req.files?.images || [];

      const imageUploads = await Promise.all(
        imageFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const baseName = (file.originalname || "").trim();
              const stripExt = (s) =>
                typeof s === "string"
                  ? s.split(".").slice(0, -1).join(".") || s
                  : s;
              const meta = imageData.find(
                (img) => stripExt(img.public_id) === stripExt(baseName),
              );

              const photographer = meta?.photographer || "";
              const index = meta?.index ?? 0;

              // sanera filnamn
              const sanitizeFilename = (name) =>
                name
                  .replace(/\s+/g, "_")
                  .replace(/\./g, "_")
                  .replace(/å/g, "a")
                  .replace(/Å/g, "A")
                  .replace(/ä/g, "a")
                  .replace(/Ä/g, "A")
                  .replace(/ö/g, "o")
                  .replace(/Ö/g, "O")
                  .replace(/[^a-zA-Z0-9_\-]/g, "");

              const safeName = sanitizeFilename(baseName);
              const shortId = uuidv4().split("-")[0];
              const publicId = `${safeName}_${shortId}`;

              cloudinary.uploader
                .upload_stream(
                  {
                    folder: "projekt",
                    public_id: publicId,
                    resource_type: "image",
                    use_filename: false,
                    unique_filename: false,
                  },
                  (err, result) => {
                    if (err) return reject(err);
                    resolve({
                      url: result.secure_url,
                      public_id: result.public_id,
                      photographer,
                      index,
                      original_temp_id: baseName,
                    });
                  },
                )
                .end(file.buffer);
            }),
        ),
      );

      imageUploads.sort((a, b) => a.index - b.index);
      const cleanedImages = imageUploads.map(({ index, ...rest }) => rest);

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
        images: cleanedImages,
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
  },
);

(router.patch("/reorder", async (req, res) => {
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
            (img) => img.public_id !== public_id,
          );
        }

        // --- Nya bilder ---
        if (req.files?.images?.length) {
          const newImageData = req.body.imageData
            ? JSON.parse(req.body.imageData).filter(
                (d) => d.index !== undefined,
              )
            : [];

          for (let i = 0; i < req.files.images.length; i++) {
            const file = req.files.images[i];

            const sanitizeFilename = (name) => {
              return name
                .replace(/\s+/g, "_") // ersätt mellanslag med _
                .replace(/\./g, "_") // ersätt punkter med _
                .replace(/å/g, "a")
                .replace(/Å/g, "A")
                .replace(/ä/g, "a")
                .replace(/Ä/g, "A")
                .replace(/ö/g, "o")
                .replace(/Ö/g, "O")
                .replace(/[^a-zA-Z0-9_\-]/g, ""); // ta bort övriga konstiga tecken
            };

            const origName = (file.originalname || "").trim();
            const baseName = origName.includes(".")
              ? origName.split(".").slice(0, -1).join(".").trim()
              : origName;

            const safeName = sanitizeFilename(baseName || origName);

            // korta UUID till t.ex. 8 tecken
            const shortId = uuidv4().split("-")[0];

            // unik, läsbar public_id
            const publicId = `${safeName}_${shortId}`;

            // tolerant matcher: compare without extensions so temp ids (no ext)
            const stripExt = (s) =>
              typeof s === "string"
                ? s.split(".").slice(0, -1).join(".") || s
                : s;
            const metaForFile = newImageData.find(
              (d) => stripExt(String(d.public_id)) === stripExt(baseName),
            );

            const uploaded = await new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream(
                  {
                    folder: "projekt",
                    public_id: publicId,
                    resource_type: "image",
                    use_filename: false,
                    unique_filename: false,
                  },
                  (err, result) => {
                    if (err) return reject(err);
                    resolve({
                      url: result.secure_url,
                      public_id: result.public_id,
                      photographer: metaForFile?.photographer || "",
                      original_temp_id: baseName,
                    });
                  },
                )
                .end(file.buffer);
            });
            project.images.push(uploaded);
          }
        }

        // --- Uppdatera fotografer och ordning ---
        if (req.body.imageData) {
          const imageData = JSON.parse(req.body.imageData);

          const stripExt = (s) =>
            typeof s === "string"
              ? s.split(".").slice(0, -1).join(".") || s
              : s;

          const matches = (dPublic, img) => {
            if (!dPublic || !img) return false;
            const dStr = String(dPublic);
            const imgPub = String(img.public_id || "");
            const imgTemp = String(img.original_temp_id || "");
            if (dStr === imgPub || dStr === imgTemp) return true;
            if (stripExt(dStr) === stripExt(imgPub)) return true;
            if (stripExt(dStr) === stripExt(imgTemp)) return true;
            return false;
          };

          imageData.forEach((d) => {
            const img = project.images.find((i) => matches(d.public_id, i));
            if (img) img.photographer = d.photographer;
          });

          // --- Uppdatera ordning ---
          const newOrder = [];
          imageData.forEach((d) => {
            const img = project.images.find((i) => matches(d.public_id, i));
            if (img) newOrder.push(img);
          });

          // Behåll även nya bilder som ännu inte fanns i imageData
          const remaining = project.images.filter(
            (img) => !newOrder.find((i) => i.public_id === img.public_id),
          );
          project.images = [...newOrder, ...remaining];
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
    },
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
        { $inc: { order: -1 } },
      );
      await project.deleteOne();

      res.json({ message: "Project deleted successfully", id });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Error deleting project" });
    }
  }));

export default router;
