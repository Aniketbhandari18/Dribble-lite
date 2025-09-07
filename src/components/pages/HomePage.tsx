import PostList from "../PostList";

export default function HomePage() {
  return (
    <div className="pt-6 p-6">
      <main className="flex flex-col items-center justify-center space-y-4 mb-14">
        <h1 className="text-2xl xs:text-3xl sm:text-5xl font-sans font-bold flex flex-col items-center justify-center">
          <p>Discover the World&apos;s</p>
          <p>Top Designs</p>
        </h1>
        <p className="max-w-110 text-center text-md font-semibold leading-5 text-gray-600">
          Explore work from the most talented and accomplished designers ready
          to take on your next project.
        </p>
      </main>

      <PostList />
    </div>
  );
}
