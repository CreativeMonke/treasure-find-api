import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_ACCES_TOKEN } from "../config/index.js";



const UserSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: "Your firstname is required",
            max: 25,
        },
        last_name:{
            type: String,
            required: "Your lastname is required",
            max: 25,
        },
        email:{
            type : String,
            required : "Your email is required",
            unique : true,
            lowercase: true,
            trim: true,
        },
        password:{
            type: String,
            required : "Your password is required",
            select: false,
            max: 40,
        },
        town:{
            type: String,
            required : false,
            max: 20,
        },
        team:{
            type: String,
            default : "default",  
        },
        role: {
            type : String,
            required: true,
            default : "0x01",
        },
    },
    {timestamps: true}
);

UserSchema.pre("save" , function (next) {
    const user = this;
    if(!user.isModified("password"))
    return next();
    bcrypt.genSalt(10, (err,salt) => {
        if(err)
        return next(err);
        
        bcrypt.hash(user.password, salt , (err,hash) => {
            if(err)
            return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.generateAccessJWT = function(){
    let paylod = {
        id:this._id,
    };
    return jwt.sign(paylod, SECRET_ACCES_TOKEN,{
        expiresIn: '60m',
    });
};

export default mongoose.model("user_infos",UserSchema);