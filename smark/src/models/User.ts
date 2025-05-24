import mongoose, {Schema, Document, Types, Model} from "mongoose";
import {IUser} from "@/types/User";

const userSchema = new Schema<IUser>(
    {
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        email: {type: String, required: true},
        marketingCampaigns: [
            {type: Schema.Types.ObjectId, ref: "MarketingCampaigns", required: true}
        ],
        role: {type: String, required: true, enum: ["admin", "employee", "developer"]}
    },
    {
        timestamps: true,
        strict:true
    }
);

const Users = mongoose.models.Users as Model<IUser> || mongoose.model<IUser>('Users', userSchema);
export default Users;
