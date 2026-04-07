"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddVendor, deleteVendor, getAllVendor, updateVendor } from "@/action/vendores";
import { StateData } from "@/utility/getStateCode";

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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<VendorFormData>({
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
      await AddVendor({ ...data });
      await updateData();
    }
    setLoading(false);
    closeModal();
  };

  useEffect(() => {
    (async () => { await updateData(); })();
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
        .finally(() => { setLoading(false); });
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-green-900 tracking-tight">Vendors</h1>
          <p className="text-xs text-green-600 mt-0.5">Manage vendor details and GST information · BioTrend Energy</p>
        </div>
        <button className="btn btn-green" onClick={() => openFormModal()}>
          + Add Vendor
        </button>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-xl shadow-lg border border-white/60"
        style={{ background: "rgba(255,255,255,0.60)", backdropFilter: "blur(16px)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-green-100/80" style={{ background: "rgba(240,253,244,0.80)" }}>
              {["Name", "Address", "State", "GST", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-green-700 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-green-100/60">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="bg-white/30 hover:bg-white/60 transition-colors duration-100">
                <td className="px-4 py-3.5 font-medium text-gray-800">{vendor.name}</td>
                <td className="px-4 py-3.5 text-gray-500 max-w-[200px] truncate">{vendor.address}</td>
                <td className="px-4 py-3.5 text-gray-600">{vendor.state}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{vendor.gst}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/70 text-gray-600 ring-1 ring-gray-200 hover:bg-white hover:text-gray-900 transition-all duration-150 shadow-sm"
                      onClick={() => openFormModal(vendor)}
                      disabled={loading}
                    >
                      Update
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 ring-1 ring-red-200 hover:bg-red-100 transition-all duration-150 shadow-sm"
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
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
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
          <div
            className="modal-box border border-white/60"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
          >
            <h3 className="font-bold text-lg text-green-900 mb-4">
              {isEditing ? "Update" : "Add"} Vendor
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700">Vendor Name</span>
                </label>
                <input {...register("name")} className="input input-bordered w-full" />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700">Vendor GST</span>
                </label>
                <input {...register("gst")} className="input input-bordered w-full" />
                {errors.gst && <p className="text-red-500 text-sm mt-1">{errors.gst.message}</p>}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700">Vendor Address</span>
                </label>
                <input {...register("address")} className="input input-bordered w-full" />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text text-gray-700">Vendor State</span>
                </label>
                <select
                  className="select select-bordered"
                  defaultValue=""
                  onChange={(v) => setValue("state", v.target.value)}
                >
                  {Object.keys(StateData).map((v, i) => (
                    <option key={i} value={v}>{v}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-green" disabled={loading}>Save</button>
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <dialog open className="modal modal-open">
          <div
            className="modal-box border border-white/60"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
          >
            <h3 className="font-bold text-lg text-green-900">Confirm Delete</h3>
            <p className="py-2 text-gray-600">
              Are you sure you want to delete <strong>{selectedVendor?.name}</strong>?
            </p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDelete} disabled={loading}>Delete</button>
              <button className="btn" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
