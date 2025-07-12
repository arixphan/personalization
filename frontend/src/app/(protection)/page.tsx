async function getUsers(): Promise<object> {
  const res = await fetch(
    "https://60bb45b342e1d000176207c6.mockapi.io/api/v1/users",
    {
      cache: "no-store", // Ensure it's server-rendered on each request
    }
  );
  return res.json();
}

export default async function Home() {
  await getUsers();

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello, Next.js!</h1>
      <ul style={{ listStyle: "none", padding: 0 }}></ul>
    </div>
  );
}
