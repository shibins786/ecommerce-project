export default function Loader({
  fullScreen = true,
  size = "w-10 h-10",
}) {
  return (
    <div
      className={
        fullScreen
          ? "flex items-center justify-center h-screen"
          : "flex items-center justify-center"
      }
    >
      <div
        className={`${size} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}