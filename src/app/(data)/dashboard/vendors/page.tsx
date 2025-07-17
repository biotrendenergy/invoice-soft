"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddVendor,
  deleteVendor,
  getAllVendor,
  updateVendor,
} from "@/action/vendores";
import { StateData } from "@/utility/getStateCode";

// Zod schema for validation
const vendorSchema = z.object({
  name: z.string().min(2, "Vendor name is required"),
  address: z.string().nullable(),
  gst: z.string().nullable(),
  state: z.string().nullable(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface Vendor {
  id: number;
  name: string;
  address: string | null;
  gst: string | null;
  state: string | null;
}

export default function VendorTable() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const updateData = async () => {
    const data = await getAllVendor();
    setVendors(data);
  };

  const openFormModal = (vendor: Vendor | null = null) => {
    setIsEditing(!!vendor);
    setSelectedVendor(vendor);
    reset(vendor ?? { name: "", address: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = async (data: VendorFormData) => {
    setLoading(true);
    if (isEditing && selectedVendor) {
      updateVendor(selectedVendor.id, data);
      await updateData();
    } else {
      await AddVendor({
        ...data,
      });
      await updateData();
    }
    setLoading(false);
    closeModal();
  };
  useEffect(() => {
    (async () => {
      await updateData();
    })();
  }, []);
  const confirmDelete = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (selectedVendor) {
      setLoading(true);
      deleteVendor(selectedVendor.id)
        .then(() => {
          updateData().then(() => {
            alert("done");
            setIsDeleteConfirmOpen(false);
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Vendors</h1>
        <button className="btn btn-primary" onClick={() => openFormModal()}>
          ➕ Add Vendor
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="uppercase">
              <th>Name</th>
              <th>Address</th>
              <th>State</th>
              <th>GST</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.name}</td>
                <td>{vendor.address}</td>
                <td>{vendor.state}</td>
                <td>{vendor.gst}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => openFormModal(vendor)}
                      disabled={loading}
                    >
                      Update
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => confirmDelete(vendor)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center text-gray-500">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Update Modal */}
      {isModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {isEditing ? "Update" : "Add"} Vendor
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vendor Name</span>
                </label>
                <input
                  {...register("name")}
                  className="input input-bordered w-full"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vendor GST</span>
                </label>
                <input
                  {...register("gst")}
                  className="input input-bordered w-full"
                />
                {errors.gst && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gst.message}
                  </p>
                )}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vendor address</span>
                </label>
                <input
                  {...register("address")}
                  className="input input-bordered w-full"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Vendor state</span>
                </label>
                <select
                  className="select select-bordered"
                  defaultValue=""
                  onChange={(v) => {
                    setValue("state", v.target.value);
                  }}
                >
                  {Object.keys(StateData).map((v, i) => (
                    <option key={i} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                {/* <input
                  {...register("state")}
                  className="input input-bordered w-full"
                /> */}
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div className="modal-action">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Save
                </button>
                <button type="button" className="btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-2">
              Are you sure you want to delete{" "}
              <strong>{selectedVendor?.name}</strong>?
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
}
