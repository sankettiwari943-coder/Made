import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CareerApplicationSchema, generateReferenceCode } from '@/lib/careers/validations';

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // 1. Authenticate session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in before applying.', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    // 2. Parse and validate body
    const body = await request.json().catch(() => ({}));
    const validation = CareerApplicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          fieldErrors: validation.error.flatten().fieldErrors,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.role_id) {
      return NextResponse.json(
        { error: 'Role ID is required.', code: 'MISSING_ROLE_ID' },
        { status: 400 }
      );
    }

    const payload = validation.data;
    const candidateEmail = (payload.email || payload.applicant_email || body.email || user.email || '')
      .trim()
      .toLowerCase();
    const resolvedFullName = (payload.full_name || payload.name || body.full_name || '').trim();

    // 3. Server-Side Check: SELECT id FROM career_applications WHERE role_id = :role_id AND (applicant_id = :userId OR email = :email)
    let checkQuery = supabase
      .from('career_applications')
      .select('id, reference_code, status, applicant_id, email, created_at')
      .eq('role_id', body.role_id);

    if (candidateEmail) {
      checkQuery = checkQuery.or(
        `applicant_id.eq.${user.id},email.eq.${candidateEmail},applicant_email.eq.${candidateEmail},user_email.eq.${candidateEmail},contact_email.eq.${candidateEmail}`
      );
    } else {
      checkQuery = checkQuery.eq('applicant_id', user.id);
    }

    const { data: existingApp, error: checkError } = await checkQuery
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!checkError && existingApp) {
      return NextResponse.json(
        {
          error: 'You have already applied for this role.',
          code: 'ALREADY_APPLIED',
          existingApplicationId: existingApp.id,
          status: existingApp.status,
        },
        { status: 409 }
      );
    }

    // 4. Generate reference code
    const refCode = generateReferenceCode();

    // 5. Insert new application with unique constraint error protection
    const { data: newApp, error: insertError } = await supabase
      .from('career_applications')
      .insert({
        reference_code: refCode,
        role_id: body.role_id,
        applicant_id: user.id,
        full_name: resolvedFullName || null,
        name: resolvedFullName || null,
        applicant_name: resolvedFullName || null,
        email: candidateEmail || null,
        applicant_email: candidateEmail || null,
        user_email: candidateEmail || null,
        contact_email: candidateEmail || null,
        cover_message: payload.cover_message,
        what_they_build: payload.what_they_build,
        experience: payload.experience,
        github_url: payload.github_url || null,
        linkedin_url: payload.linkedin_url || null,
        portfolio_url: payload.portfolio_url || null,
        resume_path: body.resume_path || null,
        additional_information: payload.additional_information || null,
        status: 'SUBMITTED',
      })
      .select('id, reference_code, status')
      .single();

    if (insertError) {
      if (
        insertError.code === '23505' ||
        insertError.message?.toLowerCase().includes('duplicate key') ||
        insertError.message?.toLowerCase().includes('uq_user_active_role_app')
      ) {
        return NextResponse.json(
          {
            error: 'You have already applied for this role.',
            code: 'ALREADY_APPLIED',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: `Database error: ${insertError.message}`, code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        referenceCode: newApp?.reference_code || refCode,
        applicationId: newApp?.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
