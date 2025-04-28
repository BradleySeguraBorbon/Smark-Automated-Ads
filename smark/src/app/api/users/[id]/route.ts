import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { Users, MarketingCampaigns } from '@/models/models';
import rollback from 'mongoose';
import { getUserFromToken } from '@/../lib/auth';

function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();

        const userToken = await getUserFromToken(request);

        if (!userToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allowedRoles = ['admin', 'developer', 'employee'];

        if (!allowedRoles.includes(userToken.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { id } = params;

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json(
                { message: 'Invalid or missing ID parameter' },
                { status: 400 }
            );
        }

        const user = await Users.findById(id).populate('marketingCampaigns', 'name startDate endDate');

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'User found',
            result: user,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Error fetching user' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();

        const user = await getUserFromToken(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allowedRoles = ['admin', 'developer', 'employee'];

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { id } = await params;

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json(
                { message: 'Invalid or missing ID parameter' },
                { status: 400 }
            );
        }

        const body = await request.json();

        if (body.role && !['admin', 'employee'].includes(body.role)) {
            return NextResponse.json(
                { message: 'Invalid role. Must be "admin" or "employee".' },
                { status: 400 }
            );
        }

        if (body.username) {
            const existingUser = await Users.findOne({
                username: body.username,
                _id: { $ne: id }
            });
            if (existingUser) {
                return NextResponse.json(
                    { message: 'A user with this username already exists' },
                    { status: 409 }
                );
            }
        }

        const updatedUser = await Users.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        ).populate('marketingCampaigns', 'name description startDate endDate');

        if (!updatedUser) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'User updated successfully',
            result: updatedUser,
        });
    } catch (error: any) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { error: error.message },
                { status: 422 }
            );
        }
        return NextResponse.json(
            { error: 'Error updating user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {

    //const session = await mongoose.startSession();
    //session.startTransaction();
    try {
        await connectDB();
        
        const user = await getUserFromToken(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allowedRoles = ['admin', 'developer'];

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }
        const { id } = params;

        if (!id || !isValidObjectId(id)) {
            //await session.abortTransaction();
            return NextResponse.json(
                { message: 'Invalid or missing ID parameter' },
                { status: 400 }
            );
        }

        const deletedUser = await Users.findByIdAndDelete(id/*, { session } */);

        if (!deletedUser) {
            //await session.abortTransaction();
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        await MarketingCampaigns.updateMany(
            { users: id },
            { $pull: { users: id } }
            // , { session } 
        );

        //await session.commitTransaction();

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Transaction error:', error);
        //await session.abortTransaction();
        return NextResponse.json(
            { error: error.message || 'Error deleting user' },
            { status: 500 }
        );
    } /*finally {
        await session.endSession();
    } */
}
