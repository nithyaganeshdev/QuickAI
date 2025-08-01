import AI from "../configs/ai.js";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

// Generate new article controller function
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // Check for free credits usage limit
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Create new Article using Gemini API
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    // AI content response
    const content = response.choices[0].message.content;

    // Store article details in database
    await sql` INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    // Update free usage credits by 1
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Generate new blog title controller function
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // Check for free credits usage limit
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Create new Article using Gemini API
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    // AI content response
    const content = response.choices[0].message.content;

    // Store article details in database
    await sql` INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    // Update free usage credits by 1
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Generate new image controller function
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    // Check for premium user
    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // Create new image using clipdrop API
    const formData = new FormData();
    form.append("prompt", prompt);
    await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: {
        "x-api-key": process.env.CLIPDROP_API_KEY,
      },
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    // Store article details in database
    await sql` INSERT INTO creations (user_id, prompt, content, type, publish)
    VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    res.json({ success: true, secure_url });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Remove background from image controller function
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { image } = req.file;
    const plan = req.plan;

    // Check for premium user
    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    // Store article details in database
    await sql` INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image'`;

    res.json({ success: true, secure_url });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Remove object from image  controller function
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const { image } = req.file;
    const plan = req.plan;

    // Check for premium user
    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    // Store article details in database
    await sql` INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image'`;

    res.json({ success: true, secure_url });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Review resume text controller function
export const resumeReviewer = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    // Check for premium user
    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    const dataBuffer = fs.readFileSync(resume);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on
    its strengths, weaknesses, and areas of improvements. Resume Content:\n\n${pdfData.text}`;

    // Create new resume review response using Gemini API
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // AI resume review content response
    const content = response.choices[0].message.content;

    // Store resume review details in database
    await sql` INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, "Review the uploaded resume", ${content}, 'resume-review'`;

    res.json({ success: true, content });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
