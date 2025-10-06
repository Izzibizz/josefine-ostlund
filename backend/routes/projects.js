import express from "express";
import cloudinary from "../config/cloudinaryConfig.js";
import { uploadToBunny, deleteFromBunny } from "../middlewares/storageBunny.js";
import Projects from "../models/projectSchema.js";
import multer from "multer";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

const router = express.Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const uploadImageFileToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    fs.createReadStream(filePath).pipe(stream);
  });
}

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
  upload.fields([{ name: "images" }, { name: "video" }]),
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
      } = req.body;

      const photographers = req.body.photographers ? JSON.parse(req.body.photographers) : [];

      // --- Bilder (Cloudinary) ---
      const imageFiles = req.files?.images || [];
      const imageUploads = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          const result = await uploadImageFileToCloudinary(file.path);
          imageUploads.push({
            url: result.secure_url,
            public_id: result.public_id,
            photographer: photographers[i] || "",
          });
        } finally {
          // radera tempfil oavsett om upload lyckades eller ej
          await fsPromises.unlink(file.path).catch(() => {});
        }
      }

      // --- Video (Bunny) ---
      let videoUpload = null;
      if (req.files?.video?.length) {
        const file = req.files.video[0];
        try {
          videoUpload = await uploadToBunny(file.path, file.originalname);
        } finally {
          await fsPromises.unlink(file.path).catch(() => {});
        }
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
      res.status(201).json({ message: "Project created successfully", project: newProject });
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Error creating project", error: error.message });
    }
  }
);

// --- UPDATE ---
router.patch(
  "/:id",
  upload.fields([{ name: "images" }, { name: "video" }]),
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
      } = req.body;

      const project = await Projects.findById(id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      // --- Ta bort bilder (Cloudinary) ---
      let removeList = [];
      if (req.body.removeImages) {
        removeList = Array.isArray(req.body.removeImages) ? req.body.removeImages : [req.body.removeImages];
      }
      for (const public_id of removeList) {
        try {
          await cloudinary.uploader.destroy(public_id);
        } catch (e) {
          console.warn("Cloudinary destroy failed for", public_id, e.message);
        }
        project.images = project.images.filter((img) => img.public_id !== public_id);
      }

      // --- Uppdatera fotografer ---
      if (req.body.imageData) {
        const imageData = JSON.parse(req.body.imageData);
        imageData.filter((d) => d.public_id).forEach((d) => {
          const img = project.images.find((i) => i.public_id === d.public_id);
          if (img) img.photographer = d.photographer;
        });
      }

      // --- Nya bilder (Cloudinary) ---
      if (req.files?.images?.length) {
        const newImageFiles = req.files.images;
        const newImageData = req.body.imageData ? JSON.parse(req.body.imageData).filter(d => d.index !== undefined) : [];

        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          try {
            const result = await uploadImageFileToCloudinary(file.path);
            project.images.push({
              url: result.secure_url,
              public_id: result.public_id,
              photographer: newImageData[i]?.photographer || "",
            });
          } finally {
            await fsPromises.unlink(file.path).catch(() => {});
          }
        }
      }

      // --- Video (Bunny) ---
      // Ta bort video om frågat
      if (removeVideo === "true" && project.video) {
        try {
          await deleteFromBunny(project.video.public_id);
        } catch (e) {
          console.warn("Could not delete video from Bunny:", e.message);
        }
        project.video = undefined;
      }

      // Ny video uppladdad
      if (req.files?.video?.[0]) {
        const file = req.files.video[0];
        // Om det redan finns en video: radera den från Bunny först
        if (project.video) {
          try {
            await deleteFromBunny(project.video.public_id);
          } catch (e) {
            console.warn("Could not delete old video from Bunny:", e.message);
          }
        }

        try {
          const uploadedVideo = await uploadToBunny(file.path, file.originalname);
          project.video = uploadedVideo;
        } finally {
          await fsPromises.unlink(file.path).catch(() => {});
        }
      }

      // --- Textfält ---
      if (name !== undefined) project.name = name;
      if (year !== undefined) project.year = year;
      if (material !== undefined) project.material = material;
      if (exhibited_at !== undefined) project.exhibited_at = exhibited_at;
      if (category !== undefined) project.category = category;
      if (description !== undefined) project.description = description;
      if (short_description !== undefined) project.short_description = short_description;
      if (size !== undefined) project.size = size;

      await project.save();
      res.json({ message: "Project updated successfully", project });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Error updating project", error: error.message });
    }
  },
  
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

      // 📹 Ta bort ev. video
      if (project.video) {
        await cloudinary.uploader.destroy(project.video.public_id, {
          resource_type: "video",
        });
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
  }),
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
  })
);

export default router;
