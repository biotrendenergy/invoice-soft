"use client";
import { deleteOcr } from "@/action/ocr";
import { ocr } from "@/generated/prisma";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DeleteButton = (data: ocr) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOcr(data.id);
      setIsDeleteConfirmOpen(false);
      router.refresh(); // Preferred in Next.js over full reload
    } catch (err) {
      console.error("Failed to delete:", err);
      // optionally show an error toast or message here
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <button
        className="btn btn-error"
        disabled={isDeleting}
        onClick={() => setIsDeleteConfirmOpen(true)}
      >
        Delete
      </button>

      {isDeleteConfirmOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-2">
              Are you sure you want to delete <strong>{data?.challan}</strong>?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                className="btn"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default DeleteButton;
