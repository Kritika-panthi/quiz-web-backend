const User = require("../model/userModel");
const Profile = require("../model/ProfileModel")
var jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

async function createUser(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const role = req.body.role || "professional";

    if (!name || !email || !password){
        return res.status(400).json({
            message: "Please Provide all required Information",
        });
    }

    const checkUser = await User.findOne({ email });
    if (checkUser){
        return res.status(400).json({
            message: "User Already Exist",
        });
    }

    const encryptPassword = await bcrypt.hash(password, 10);

    const userData ={
        name,
        username,
        email,
        password: encryptPassword,
        role,
    };

    const user = new User(userData);
    await user.save();
    const userId = user?._id;

    const profileData = {
        user: userId,
        bio: "",
        profilePicture: "",
        skills:[],
        github: "",
        linkedin: "",
        portfolioUrl: "",

    };
    const profile = new Profile(profileData);
    await profile.save();
    
    res.status(201).json({
        message: "User created successfully",
        user: user,
    });
}

async function LoginUserController(req, res){
    const { email, password } = req.body;

    if (!email || !password){
        return res.status(400).json({
            message: "Please Provide all required Information",
        });
    }


    const checkUser = await User.findOne({ email }).select("+password");
    if (!checkUser){
        return res.status(400).json({
            message: "User with this email does not exist",
        });
    }

    const comparePassword = await bcrypt.compare(password, checkUser.password);
    if (comparePassword) {
        const token = jwt.sign(
            {
                id: checkUser._id,
                role: checkUser.role,
            },
            process.env.AUTH_SECRET_KEY,
            {
                expiresIn: "1h",
            }
        );
        res.status(200).json({
            message: "Login Successful",
            accessToken: token,
        });
    } else {
        return res.status(400).json({
            message: "Invalid Credentials",
        });
    }
}


async function getUserListController(req, res){
    const userList = await User.find();

    res.status(200).json({
        message: "User list Fetched Sucessfully",
        users: userList,
    });

}

async function updateProfileMeController(req, res) { 
    try {

        console.log('Request body:', req.body);
        console.log('File info:', req.file);

        const { id } = req.user;
        const { bio, github, linkedin, portfolioUrl, skills } = req.body;
        
        const updateData = {
            bio: bio || "",
            github: github || "",
            linkedin: linkedin || "",
            portfolioUrl: portfolioUrl || "",
        };

        // Parse skills if provided
        if (skills) {
            try {
                updateData.skills = JSON.parse(skills);
            } catch (e) {
                console.log('Skills parse error:', e);
                updateData.skills = [];
            }
        }

        // Add profile picture if uploaded
        if (req.file) {
            // Fixed: consistent variable name
            updateData.profilePicture = `/uploads/profile/${req.file.filename}`;
        }

        const updatedProfile = await Profile.findOneAndUpdate(
            { user: id },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: "Profile updated successfully",
            profile: updatedProfile
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }   
}


async function viewMyProfileController(req, res) {
    try {
        const { id } = req.user; // from JWT token
        
        // Get user data (exclude password)
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Get profile data
        const profile = await Profile.findOne({ user: id });

        res.status(200).json({
            message: "Profile fetched successfully",
            user: user,
            profile: profile
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            message: "Failed to fetch profile",
            error: error.message
        });
    }
}

async function viewProfileofUserController(req, res) {
    try {
        const { id } = req.params; // user ID from URL parameter
        
        // Get user data (exclude password)
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Get profile data
        const profile = await Profile.findOne({ user: id });

        res.status(200).json({
            message: "User profile fetched successfully",
            user: user,
            profile: profile
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({
            message: "Failed to fetch user profile",
            error: error.message
        });
    }
 
}


module.exports = {
    createUser,
    LoginUserController,
    getUserListController,
    updateProfileMeController,
    viewProfileofUserController,
    viewMyProfileController,
};