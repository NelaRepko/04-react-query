import toast from "react-hot-toast";
import styles from "./SearchBar.module.css";

// ✅ export вирішує проблему з noUnusedLocals
export type SearchBarProps = {
  onSubmit: (query: string) => void;
};

export default function SearchBar({ onSubmit }: SearchBarProps) {
  // Використовуємо Form Actions API через action
  const handleSubmitAction = async (formData: FormData) => {
    const value = (formData.get("query") as string | null)?.trim() ?? "";

    if (!value) {
      toast.error("Please enter your search query.");
      return;
    }

    onSubmit(value);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a
          className={styles.link}
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by TMDB
        </a>

        {/* Використовуємо action замість onSubmit */}
        <form
          className={styles.form}
          action={async (formData: FormData) => {
            await handleSubmitAction(formData);
          }}
        >
          <input
            className={styles.input}
            type="text"
            name="query"
            autoComplete="off"
            placeholder="Search movies..."
            autoFocus
          />

          <button className={styles.button} type="submit">
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
