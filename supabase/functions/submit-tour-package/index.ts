import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Missing authorization header." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return jsonResponse({ error: "You must be signed in to list a tour." }, 401);

    const body = await req.json();
    if (!body.title?.trim()) return jsonResponse({ error: "Package title is required." }, 400);
    if (!body.description?.trim() || body.description.trim().length < 50) {
      return jsonResponse({ error: "Description must be at least 50 characters." }, 400);
    }
    if (!body.destination?.trim() && !body.location_city?.trim()) {
      return jsonResponse({ error: "Destination or city is required." }, 400);
    }
    if (!Number.isFinite(body.price_per_person) || body.price_per_person <= 0) {
      return jsonResponse({ error: "Price per person is required." }, 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: guide, error: guideError } = await adminClient
      .from("tour_guides")
      .select("id")
      .eq("id", body.guide_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (guideError || !guide) return jsonResponse({ error: "Your operator profile could not be verified." }, 403);

    const { data: newPackage, error: insertError } = await adminClient
      .from("tours")
      .insert({
        guide_id: guide.id,
        title: body.title.trim(),
        description: body.description.trim(),
        tour_type: body.tour_type ?? "adventure",
        duration_hours: body.duration_hours ?? 4,
        duration_days: body.duration_days ?? null,
        price_per_person: body.price_per_person,
        currency: body.currency ?? "INR",
        max_group_size: body.max_group_size ?? 10,
        min_group_size: body.min_group_size ?? 1,
        difficulty_level: body.difficulty_level ?? "moderate",
        booking_type: body.booking_type ?? "enquiry",
        featured_image: body.featured_image || null,
        location_city: body.location_city?.trim() ?? "",
        location_state: body.location_state?.trim() ?? "",
        destination: body.destination?.trim() || null,
        accommodation_type: body.accommodation_type || null,
        transport_type: body.transport_type || null,
        meals_included: Array.isArray(body.meals_included) ? body.meals_included : [],
        equipment_included: Array.isArray(body.equipment_included) ? body.equipment_included : [],
        guide_included: body.guide_included ?? true,
        included_items: Array.isArray(body.included_items) ? body.included_items : [],
        excluded_items: Array.isArray(body.excluded_items) ? body.excluded_items : [],
        cancellation_policy: body.cancellation_policy?.trim() ?? "",
        pricing_notes: body.pricing_notes?.trim() || null,
        itinerary: Array.isArray(body.itinerary) ? body.itinerary : [],
        operator_name: body.operator_name?.trim() || null,
        operator_instagram: body.operator_instagram?.trim() || null,
        operator_website: body.operator_website?.trim() || null,
        operator_phone: body.operator_phone?.trim() || null,
        operator_email: body.operator_email?.trim() || null,
        is_operator_verified: false,
        package_status: body.package_status === "draft" ? "draft" : "pending_review",
        is_active: true,
      })
      .select("id")
      .maybeSingle();

    if (insertError || !newPackage) {
      console.error("Tour package insert error:", insertError);
      return jsonResponse({ error: "Could not save the tour package." }, 500);
    }

    return jsonResponse({ id: newPackage.id, success: true });
  } catch (error) {
    console.error("Tour package function error:", error);
    return jsonResponse({ error: "Could not save the tour package." }, 500);
  }
});
