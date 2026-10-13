import { createClient } from "npm:@supabase/supabase-js@2.57.4";
// verify_jwt is false in config.toml; auth is verified inside the function body.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create a client with the user's JWT to verify auth
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "You must be signed in to add a place." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.title?.trim()) {
      return new Response(
        JSON.stringify({ error: "Title is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!body.description?.trim() || body.description.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Description must be at least 50 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    // Use service-role client to insert — bypasses PostgREST schema cache issues
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    if (body.kind === "tour_package") {
      if (!body.title?.trim()) return new Response(
        JSON.stringify({ error: "Package title is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
      if (!body.description?.trim() || body.description.trim().length < 50) return new Response(
        JSON.stringify({ error: "Description must be at least 50 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
      if (!Number.isFinite(body.price_per_person) || body.price_per_person <= 0) return new Response(
        JSON.stringify({ error: "Price per person is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );

      const { data: guide, error: guideError } = await adminClient
        .from("tour_guides")
        .select("id")
        .eq("id", body.guide_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (guideError || !guide) return new Response(
        JSON.stringify({ error: "Your operator profile could not be verified." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );

      const { data: newPackage, error: packageError } = await adminClient
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

      if (packageError || !newPackage) {
        console.error("Tour package insert error:", packageError);
        return new Response(
          JSON.stringify({ error: "Could not save the tour package." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ id: newPackage.id, success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!body.location?.trim()) {
      return new Response(
        JSON.stringify({ error: "Location is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: newGem, error: insertError } = await adminClient
      .from("hidden_gems")
      .insert({
        title: body.title.trim(),
        description: body.description.trim(),
        location: body.location.trim(),
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        category: body.category ?? "other",
        difficulty_level: body.difficulty_level ?? "easy",
        image_url: body.image_url ?? null,
        best_time_to_visit: body.best_time_to_visit?.trim() || null,
        tips: body.tips?.trim() || null,
        submitted_by: user.id,
        verification_status: "pending",
        place_attributes: body.place_attributes ?? [],
        evidence_labels: body.evidence_labels ?? [],
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Could not save the place: " + insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Update contribution stats (non-blocking)
    try {
      const { data: contribution } = await adminClient
        .from("user_contributions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (contribution) {
        await adminClient
          .from("user_contributions")
          .update({
            gems_discovered: contribution.gems_discovered + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } else {
        await adminClient
          .from("user_contributions")
          .insert({
            user_id: user.id,
            gems_discovered: 1,
            gems_verified: 0,
            total_votes_received: 0,
            explorer_level: 1,
          });
      }
    } catch (statsErr) {
      console.error("Non-blocking: contribution stats error:", statsErr);
    }

    return new Response(
      JSON.stringify({ id: newGem.id, success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
