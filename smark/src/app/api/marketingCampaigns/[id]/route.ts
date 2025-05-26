import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { MarketingCampaigns, AdMessages, Tags, Users, Clients } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import {sanitizeRequest} from "@/lib/utils/sanitizeRequest";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function validateObjectIdsExist(ids: string[], model: any, fieldName: string) {
  const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
  const foundDocs = await model.find({ _id: { $in: validIds } }).select('_id');
  const foundIds = new Set(foundDocs.map((doc: any) => doc._id.toString()));
  const invalid = ids.filter(id => !foundIds.has(id));
  return invalid.length === 0 ? null : { field: fieldName, invalidIds: invalid };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const allowedRoles = ['developer', 'admin', 'employee'];

    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    const campaign = await MarketingCampaigns.findById(id)
      .populate('tags', 'name')
      .populate('users', 'username');

    if (!campaign) {
      return NextResponse.json(
        { message: 'Marketing campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Marketing campaign found',
      result: campaign,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error fetching marketing campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();

  const allowedRoles = ['developer', 'admin'];
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
  }

  const { id } = await params;
  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
  }

  const result = await sanitizeRequest(request, {
    requiredFields: ['name', 'description', 'startDate', 'endDate', 'tags'],
    dates: ['startDate', 'endDate'],
    enums: [{ field: 'status', allowed: ['active', 'inactive', 'completed'] }]
  });
  if (!result.ok) return result.response;
  const body = result.data;

  if (new Date(body.endDate) <= new Date(body.startDate)) {
    return NextResponse.json({ message: 'End date must be after start date' }, { status: 400 });
  }

  const tags = body.tags;
  const userIds = body.users || [];

  const [invalidTags, invalidUsers] = await Promise.all([
    validateObjectIdsExist(tags, Tags, 'tags'),
    validateObjectIdsExist(userIds, Users, 'users'),
  ]);

  const invalidRefs = [invalidTags, invalidUsers].filter(Boolean);
  if (invalidRefs.length > 0) {
    return NextResponse.json({
      message: 'Invalid references found in request',
      details: invalidRefs
    }, { status: 400 });
  }

  try {
    const updated = await MarketingCampaigns.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ message: 'Marketing campaign not found' }, { status: 404 });
    }

    const campaign = await MarketingCampaigns.findById(id)
        .populate('tags', '_id name')
        .populate('users', '_id username role');

    return NextResponse.json({ message: 'Marketing campaign updated successfully', result: campaign });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
        { error: error.message || 'Error updating marketing campaign' },
        { status: error.name === 'ValidationError' ? 422 : 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const allowedRoles = ['developer', 'admin'];

    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid or missing ID parameter' },
        { status: 400 }
      );
    }

    const batchSize = 100;
    let remainingDocuments = true;

    while (remainingDocuments) {
      const adMessagesBatch = await AdMessages.find({ marketingCampaign: id })
        .limit(batchSize)
        .select('_id');

      if (adMessagesBatch.length === 0) {
        remainingDocuments = false;
        break;
      }
      const adMessageIds = adMessagesBatch.map(doc => doc._id);

      await AdMessages.deleteMany({ _id: { $in: adMessageIds } });
    }

    await Users.updateMany(
      { marketingCampaigns: id },
      { $pull: { marketingCampaigns: id } }
    );

    const deletedCampaign = await MarketingCampaigns.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return NextResponse.json(
        { message: 'Marketing campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Marketing campaign and all related ad messages deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error deleting marketing campaign' },
      { status: 500 }
    );
  }
}
