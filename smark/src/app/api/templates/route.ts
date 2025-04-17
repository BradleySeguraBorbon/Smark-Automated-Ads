import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import Templates from '@/models/Template';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const filter: Record<string, any> = {};
    if (searchParams.has('type')) {
      filter.type = searchParams.get('type');
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { message: 'Invalid parameters: page and limit should be greater than 0.' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      Templates.find(filter).skip(skip).limit(limit),
      Templates.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      total,
      totalPages,
      page,
      limit,
      results: templates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Error fetching templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const requiredFields = ['name', 'type', 'html'];
    const missingFields = requiredFields.filter(
      field => body[field] === undefined || body[field] === null
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: 'Missing required fields', missingFields },
        { status: 400 }
      );
    }

    const existingTemplate = await Templates.findOne({ name: body.name });
    if (existingTemplate) {
      return NextResponse.json(
        { message: 'A template with this name already exists' },
        { status: 409 }
      );
    }

    const newTemplate = await Templates.create({
      name: body.name,
      type: body.type,
      html: body.html,
      placeholders: body.placeholders || []
    });

    return NextResponse.json(
      { message: 'Template created successfully', result: newTemplate },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating template:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: 'Error creating template' },
      { status: 500 }
    );
  }
}