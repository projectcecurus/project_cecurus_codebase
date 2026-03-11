import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import App from "./App";


test("renders summary cards and flagged records table", async () => {
  render(<App />);

  expect(screen.getByText("Local Claims Review Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Total Claims Processed")).toBeInTheDocument();
  expect(screen.getByText("Flagged Records")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("EXACT-1")).toBeInTheDocument();
  });
});


test("loads detail panel when a flag row is clicked", async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText("EXACT-1")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText("EXACT-1"));

  await waitFor(() => {
    expect(screen.getAllByText("EXACT-1").length).toBeGreaterThan(0);
    expect(screen.getByText("Claim Amount: 275")).toBeInTheDocument();
  });
});
