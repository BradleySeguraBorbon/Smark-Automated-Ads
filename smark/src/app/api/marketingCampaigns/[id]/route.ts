import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { MarketingCampaigns, AdMessages, Tags, Users, Clients } from '@/models/models';

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
    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid or missing ID parameter' },
        { status: 400 }
      );
    }

    const campaign = await MarketingCampaigns.findById(id)
      .populate('tags.tag', 'name')
      .populate('audiencePreview', 'name email')
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
  try {
    await connectDB();
    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid or missing ID parameter' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (body.startDate && isNaN(Date.parse(body.startDate))) {
      return NextResponse.json(
        { message: 'Invalid startDate format' },
        { status: 400 }
      );
    }

    if (body.endDate && isNaN(Date.parse(body.endDate))) {
      return NextResponse.json(
        { message: 'Invalid endDate format' },
        { status: 400 }
      );
    }

    if (body.startDate && body.endDate && new Date(body.endDate) <= new Date(body.startDate)) {
      return NextResponse.json(
        { message: 'End date must be after start date' },
        { status: 400 }
      );
    }

    if (body.name) {
      const existingCampaign = await MarketingCampaigns.findOne({
        name: body.name,
        _id: { $ne: id }
      });
      if (existingCampaign) {
        return NextResponse.json(
          { message: 'A campaign with this name already exists' },
          { status: 409 }
        );
      }
    }

    const tags = body.tags?.map((tag: any) => tag.tag) || [];
    const audienceIds = body.audiencePreview || [];
    const userIds = body.users || [];

    const [invalidTags, invalidAudience, invalidUsers] = await Promise.all([
      tags.length ? validateObjectIdsExist(tags, Tags, 'tags') : null,
      audienceIds.length ? validateObjectIdsExist(audienceIds, Clients, 'audiencePreview') : null,
      userIds.length ? validateObjectIdsExist(userIds, Users, 'users') : null,
    ]);

    const invalidRefs = [invalidTags, invalidAudience, invalidUsers].filter(Boolean);
    if (invalidRefs.length > 0) {
      return NextResponse.json({
        message: 'Invalid references found in update',
        details: invalidRefs
      }, { status: 400 });
    }


    const updatedCampaign = await MarketingCampaigns.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
      .populate('tags.tag', 'name')
      .populate('audiencePreview', 'name email')
      .populate('users', 'name email');

    if (!updatedCampaign) {
      return NextResponse.json(
        { message: 'Marketing campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Marketing campaign updated successfully',
      result: updatedCampaign,
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
      { error: 'Error updating marketing campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
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
