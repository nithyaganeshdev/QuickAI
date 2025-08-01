import sql from "../configs/db.js";

// Get specific user creations
export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();

    const creations =
      await sql` SELECT * FROM creations WHERE user_id = ${userId} 
      ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all users pubslished creations
export const getPublishedCreations = async (req, res) => {
  try {
    const creations = await sql`SELECT * FROM creations WHERE publish = true 
    ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// toggle Like creation controller function
export const toggleLikeCreation = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    const currentLikes = creation.likes;
    const userIdString = userId.toString();
    let updatedLikes;
    let message;

    // Check for user already liked or unliked using user id
    if (currentLikes.includes(userIdString)) {
      updatedLikes = currentLikes.filter((user) => user !== userIdString);
      message = "Creation Unliked";
    } else {
      updatedLikes = [...currentLikes, userIdString];
      message = "Creation Liked";
    }

    const formattedArray = `${updatedLikes.join(",")}`;

    await sql`UPDATE creations SET likes = ${formattedArray}::text[]
    WHERE id = ${id}`;

    res.json({ success: true, message });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
