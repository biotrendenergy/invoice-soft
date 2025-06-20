"use client";

import React, { startTransition, useState } from "react";
import Link from "next/link";
import EditButton from "./_components/editButton";
import DeleteButton from "./_components/deleteButton";
import { ocr } from "@/generated/prisma";
import { deleteMultipleOCR } from "@/action/ocr";

type Record = ocr;

const RecordTable = ({ data }: { data: Record[] }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (!confirm("Are you sure you want to delete selected records?")) return;

    startTransition(async () => {
      await deleteMultipleOCR(selected.map((v) => Number(v))); // directly calls server function
      window.location.reload(); // OR trigger refresh using router if needed
    });
  };
  return (
    <>
      <div className="mb-4">
        <button
          className="btn btn-error"
          onClick={handleDeleteSelected}
          disabled={selected.length === 0}
        >
          Delete Selected
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selected.length === data.length}
                  onChange={(e) => {
                    setSelected(
                      e.target.checked ? data.map((d) => d.id.toString()) : []
                    );
                  }}
                />
              </th>
              <th>#</th>
              <th>Challan</th>
              <th>Address</th>
              <th>Delivery Date</th>
              <th>Vehicle Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ocr, index) => (
              <tr key={ocr.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(ocr.id.toString())}
                    onChange={() => toggleSelect(ocr.id.toString())}
                  />
                </td>
                <td>{index + 1}</td>
                <td>{ocr.challan}</td>
                <td>{ocr.address}</td>
                <td>{new Date(ocr.delivery_date).toLocaleDateString()}</td>
                <td>{ocr.vehicle_number}</td>
                <td>{ocr.delivery_status}</td>
                <td className="flex flex-wrap gap-2">
                  <Link href={`/data/${ocr.id}`}>
                    <button className="btn btn-sm btn-primary">
                      Print annexure
                    </button>
                  </Link>
                  <Link href={`/challan/${ocr.id}`}>
                    <button className="btn btn-sm btn-secondary">
                      Print Challan
                    </button>
                  </Link>
                  <EditButton {...ocr} />
                  {/* <DeleteButton {...ocr} /> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default RecordTable;
