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

// CREATE a new project
router.post("/newProject", async (req, res) => {
  try {
    const newProject = new Projects(req.body);
    await newProject.save();
    res
      .status(201)
      .json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
});

// UPDATE an existing project
router.patch("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const updatedProject = await Projects.findByIdAndUpdate(
      projectId,
      req.body,
      { new: true }
    );

    if (updatedProject) {
      res
        .status(200)
        .json({ message: "Project updated successfully", project: updatedProject });
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project" });
  }
});

// DELETE a project
router.delete("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const deletedProject = await Projects.findByIdAndDelete(projectId);

    if (deletedProject) {
      res.status(200).json({ message: "Project deleted successfully" });
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
});

// ADD image to a project
router.post(
  "/:projectId/addImage",
  upload.single("image"),
  async (req, res) => {
    try {
      const { projectId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided." });
      }

      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;

      const uploaded = await cloudinary.uploader.upload(fileStr, {
        folder: "project-images",
      });

      // Push an object with url and public_id
      const updatedProject = await Projects.findByIdAndUpdate(
        projectId,
        {
          $push: {
            images: {
              url: uploaded.secure_url,
              public_id: uploaded.public_id,
            },
          },
        },
        { new: true }
      );

      res.status(200).json({ message: "Image uploaded", project: updatedProject });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to upload image" });
    }
  }
);

// DELETE image from a project
router.delete("/:projectId/deleteImage", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: "public_id is required" });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Remove image from MongoDB array by public_id
    const updatedProject = await Projects.findByIdAndUpdate(
      projectId,
      { $pull: { images: { public_id } } },
      { new: true }
    );

    res.status(200).json({ message: "Image deleted", project: updatedProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete image" });
  }
});

export default router;
