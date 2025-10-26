export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div
        className="h-16 w-16 border-4 border-solid border-gray-300 border-t-transparent rounded-full animate-spin"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}