function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search products..."
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "12px",
        marginBottom: "20px",
      }}
    />
  );
}

export default SearchBar;