import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function NewsletterSignup() {
  return (
    <section className="w-full bg-cream py-16">
      <Container>
        <Card variant="elevated" className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl text-indigo">Stay connected</h2>
          <p className="mt-3 text-warm-gray">
            Monthly updates on festivals, programs, and community news — no spam.
          </p>
          <div className="mt-6 text-left">
            <NewsletterForm source="homepage_footer" />
          </div>
        </Card>
      </Container>
    </section>
  );
}
