import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { menuItems } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

// Plain progressive-enhancement form handler: native <form> POSTs can only
// do GET/POST, so the intended operation travels as a hidden "_action"
// field instead of an HTTP verb. Redirects back to the referring admin page
// on success so the editor works without any client-side JS.
export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const action = String(formData.get('_action') || '');
  const redirectTo = String(formData.get('_redirect') || '/admin/menu');

  try {
    switch (action) {
      case 'create': {
        await db.insert(menuItems).values({
          section: String(formData.get('section') || ''),
          subheading: (formData.get('subheading') as string) || null,
          name: String(formData.get('name') || ''),
          price: String(formData.get('price') || ''),
          description: (formData.get('description') as string) || null,
          sortOrder: Number(formData.get('sortOrder') || 0),
          isNote: formData.get('isNote') === 'on',
        });
        break;
      }
      case 'update': {
        const id = Number(formData.get('id'));
        await db
          .update(menuItems)
          .set({
            section: String(formData.get('section') || ''),
            subheading: (formData.get('subheading') as string) || null,
            name: String(formData.get('name') || ''),
            price: String(formData.get('price') || ''),
            description: (formData.get('description') as string) || null,
            sortOrder: Number(formData.get('sortOrder') || 0),
            isNote: formData.get('isNote') === 'on',
          })
          .where(eq(menuItems.id, id));
        break;
      }
      case 'toggle-active': {
        const id = Number(formData.get('id'));
        const isActive = formData.get('isActive') === 'true';
        await db.update(menuItems).set({ isActive: !isActive }).where(eq(menuItems.id, id));
        break;
      }
      case 'delete': {
        const id = Number(formData.get('id'));
        await db.delete(menuItems).where(eq(menuItems.id, id));
        break;
      }
      default:
        return new Response('Unknown action', { status: 400 });
    }
  } catch (err) {
    console.error('admin/menu-items error:', err);
    return new Response(`Failed to save: ${err instanceof Error ? err.message : 'unknown error'}`, { status: 500 });
  }

  return redirect(redirectTo);
};
