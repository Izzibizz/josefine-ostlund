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
  upload.fields([{ name: "images" }, { name: "video" }]),
  async (req, res) => {
    try {
      const { name, year, material, exhibited_at, category, description } = req.body;

      // 📸 ta emot fotografer
      const photographers = Array.isArray(req.body.photographers)
        ? req.body.photographers
        : req.body.photographers
        ? [req.body.photographers]
        : [];

      const imageFiles = req.files?.images || [];
      const imageUploads = await Promise.all(
        imageFiles.map(
          (file, i) =>
            new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream({ resource_type: "image" }, (err, result) => {
                  if (err) return reject(err);
                  resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                    photographer: photographers[i] || "", // ✅ lägg till rätt fotograf
                  });
                })
                .end(file.buffer);
            })
        )
      );

      // 📹 video samma som innan...
      let videoUpload = null;
      if (req.files?.video?.length > 0) {
        const file = req.files.video[0];
        videoUpload = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "video" }, (err, result) => {
              if (err) return reject(err);
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            })
            .end(file.buffer);
        });
      }

      const newProject = new Projects({
        name,
        year: Number(year),
        material,
        exhibited_at,
        category,
        description,
        images: imageUploads,
        video: videoUpload,
      });

      await newProject.save();
      res.status(201).json({ message: "Project created successfully", project: newProject });
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Error creating project" });
    }
  }
);


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
        removeVideo,
      } = req.body;

      console.log("removeImages raw:", req.body.removeImages);
      console.log("removeVideo raw:", removeVideo);

      const project = await Projects.findById(id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      let removeList = [];
      if (req.body.removeImages) {
        if (Array.isArray(req.body.removeImages)) {
          removeList = req.body.removeImages;
        } else if (typeof req.body.removeImages === "string") {
          removeList = [req.body.removeImages];
        }
      }

      for (const public_id of removeList) {
        await cloudinary.uploader.destroy(public_id);
        project.images = project.images.filter((img) => img.public_id !== public_id);
      }

      if (removeVideo === "true" && project.video) {
        await cloudinary.uploader.destroy(project.video.public_id, { resource_type: "video" });
        project.video = undefined;
      }

      if (req.files?.images?.length) {
        for (const file of req.files.images) {
          const uploaded = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ resource_type: "image" }, (err, result) => {
                if (err) return reject(err);
                resolve({ url: result.secure_url, public_id: result.public_id });
              })
              .end(file.buffer);
          });
          project.images.push(uploaded);
        }
      }

      if (req.files?.video?.[0]) {
        if (project.video) {
          await cloudinary.uploader.destroy(project.video.public_id, { resource_type: "video" });
        }
        const file = req.files.video[0];
        const uploadedVideo = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "video" }, (err, result) => {
              if (err) return reject(err);
              resolve({ url: result.secure_url, public_id: result.public_id });
            })
            .end(file.buffer);
        });
        project.video = uploadedVideo;
      }

      // --- Textfält ---
      if (name !== undefined) project.name = name;
      if (year !== undefined) project.year = Number(year);
      if (material !== undefined) project.material = material;
      if (exhibited_at !== undefined) project.exhibited_at = exhibited_at;
      if (category !== undefined) project.category = category;
      if (description !== undefined) project.description = description;

      await project.save();
      res.json({ message: "Project updated successfully", project });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Error updating project" });
    }
  }
);


export default router;
