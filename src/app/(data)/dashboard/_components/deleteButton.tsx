"use client";
import { deleteOcr } from "@/action/ocr";
import { ocr } from "@/generated/prisma";
import { useState } from "react";

const DeleteButton = (data: ocr) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const handleDelete = async () => {
    await deleteOcr(data.id);
    setIsDeleteConfirmOpen(false);
    window.location.reload();
  };
  return (
    <div>
      <button
        className="btn btn-error"
        onClick={() => {
          setIsDeleteConfirmOpen(true);
        }}
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
                disabled={loading}
              >
                Delete
              </button>
              <button
                className="btn"
                onClick={() => setIsDeleteConfirmOpen(false)}
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
