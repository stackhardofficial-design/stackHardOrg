import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const nowIso = new Date().toISOString();

    // 1. Lectura y actualización en system_heartbeat
    const { data: heartbeat, error: hbError } = await supabase
      .from('system_heartbeat')
      .upsert(
        {
          id: 'heartbeat',
          last_ping: nowIso,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    // 2. Consulta de verificación en projects
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (hbError && countError) {
      throw hbError || countError;
    }

    return NextResponse.json({
      success: true,
      status: 'active',
      message: 'Supabase base de datos activa y operativa (Keep-Alive exitoso)',
      timestamp: nowIso,
      total_projects: count || 0,
      heartbeat_record: heartbeat || null,
    });
  } catch (error: any) {
    console.error('Error en Supabase Keep-Alive:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: 'Fallo al realizar ping a Supabase',
        error: error.message || error,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
