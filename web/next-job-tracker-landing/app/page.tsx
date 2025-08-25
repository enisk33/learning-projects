
import {Button,buttonVariants} from "@/components/ui/button";
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white"> 
    <main className="flex-1">
      <section className="container mx-auto px-4 py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-black mb-6">A better way to track your job application</h1>
          <p className="text-muted-foreground mb-10 text-xl">Capture,organize,and manage your job search in one place</p>

        </div>
      
        <div className="mx-auto max-w-4xl text-center">
          <Button>Start for free</Button>
          </div>
          
              <p className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Free forever no credit card required
                </p>
      </section>
    </main>
    </div>
  );
}
