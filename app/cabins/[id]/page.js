import Cabin from "@/app/_components/Cabin";
import Reservation from "@/app/_components/Reservation";
import Spinner from "@/app/_components/Spinner";
import { getCabin, getCabins } from "@/app/_lib/data-service";
import { Suspense } from "react";

// Optional: Add dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { name } = await getCabin(params?.id);
  return {
    title: `Cabin ${name}`,
  };
}

// Generates static paths for all cabins at build time
export async function generateStaticParams() {
  const cabins = await getCabins();
  return cabins.map((cabin) => ({ id: String(cabin.id) }));
}

export default async function Page({ params }) {
  const cabin = await getCabin(params?.id);

  return (
    <>
      <div className="max-w-6xl mx-auto mt-8">
        <Cabin cabin={cabin} />
      </div>

      <div>
        <h2 className="text-5xl font-semibold text-center mb-10 text-accent-400">
          Reserve {cabin.name} today. Pay on arrival.
        </h2>

        {/* Suspense is useful only for lazy-loading client components or data */}
        <Suspense fallback={<Spinner />}>
          <Reservation cabin={cabin} />
        </Suspense>
      </div>
    </>
  );
}
