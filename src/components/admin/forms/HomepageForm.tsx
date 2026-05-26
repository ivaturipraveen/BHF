'use client';

import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormShell } from '@/components/admin/FormShell';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import type { HomepageConfig, Event, Program } from '@/types/db';

interface FormValues extends Record<string, unknown> {
  hero_image_url: string;
  stat_families_served: string;
  stat_festivals_hosted: string;
  stat_youth_in_programs: string;
  stat_seva_hours: string;
  featured_event_ids: string[];
  featured_program_ids: string[];
}

function buildInitial(h: HomepageConfig | null): FormValues {
  return {
    hero_image_url: h?.hero_image_url ?? '',
    stat_families_served: String(h?.stat_families_served ?? 0),
    stat_festivals_hosted: String(h?.stat_festivals_hosted ?? 0),
    stat_youth_in_programs: String(h?.stat_youth_in_programs ?? 0),
    stat_seva_hours: String(h?.stat_seva_hours ?? 0),
    featured_event_ids: h?.featured_event_ids ?? [],
    featured_program_ids: h?.featured_program_ids ?? [],
  };
}

interface Props {
  existing: HomepageConfig | null;
  events: Event[];
  programs: Program[];
}

export function HomepageForm({ existing, events, programs }: Props) {
  const initial = buildInitial(existing);
  return (
    <FormShell<FormValues>
      resource="homepage"
      initialValues={initial}
      endpoint={{ method: 'PATCH', path: '/api/admin/homepage-config' }}
      title="Homepage configuration"
      description="Choose featured events, programs, and tune the stats shown on the home page."
      buildPayload={(v) => ({
        hero_image_url: v.hero_image_url || null,
        stat_families_served: Number(v.stat_families_served) || 0,
        stat_festivals_hosted: Number(v.stat_festivals_hosted) || 0,
        stat_youth_in_programs: Number(v.stat_youth_in_programs) || 0,
        stat_seva_hours: Number(v.stat_seva_hours) || 0,
        featured_event_ids: v.featured_event_ids,
        featured_program_ids: v.featured_program_ids,
      })}
    >
      {({ values, setField }) => {
        const toggleEvent = (id: string, checked: boolean) => {
          const set = new Set(values.featured_event_ids);
          if (checked) set.add(id); else set.delete(id);
          setField('featured_event_ids', Array.from(set));
        };
        const toggleProgram = (id: string, checked: boolean) => {
          const set = new Set(values.featured_program_ids);
          if (checked) set.add(id); else set.delete(id);
          setField('featured_program_ids', Array.from(set));
        };
        return (
          <>
            <Card>
              <h3 className="font-display text-lg text-indigo mb-3">Hero</h3>
              <ImageUploadField label="Hero image URL" value={values.hero_image_url} onChange={(v) => setField('hero_image_url', v)} />
            </Card>

            <Card className="space-y-4">
              <h3 className="font-display text-lg text-indigo">Stats</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Families served" type="number" value={values.stat_families_served} onChange={(e) => setField('stat_families_served', e.target.value)} />
                <Input label="Festivals hosted" type="number" value={values.stat_festivals_hosted} onChange={(e) => setField('stat_festivals_hosted', e.target.value)} />
                <Input label="Youth in programs" type="number" value={values.stat_youth_in_programs} onChange={(e) => setField('stat_youth_in_programs', e.target.value)} />
                <Input label="Seva hours" type="number" value={values.stat_seva_hours} onChange={(e) => setField('stat_seva_hours', e.target.value)} />
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-lg text-indigo mb-3">Featured events</h3>
              {events.length === 0 ? (
                <p className="text-sm text-warm-gray">No events yet.</p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {events.map((e) => (
                    <li key={e.id}>
                      <Checkbox
                        label={`${e.title} (${e.status})`}
                        checked={values.featured_event_ids.includes(e.id)}
                        onChange={(ev) => toggleEvent(e.id, ev.target.checked)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h3 className="font-display text-lg text-indigo mb-3">Featured programs</h3>
              {programs.length === 0 ? (
                <p className="text-sm text-warm-gray">No programs yet.</p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {programs.map((p) => (
                    <li key={p.id}>
                      <Checkbox
                        label={`${p.title} (${p.status})`}
                        checked={values.featured_program_ids.includes(p.id)}
                        onChange={(ev) => toggleProgram(p.id, ev.target.checked)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        );
      }}
    </FormShell>
  );
}
