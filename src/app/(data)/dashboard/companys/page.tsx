"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyDetail } from "@/generated/prisma";
import {
  AddCompany,
  deleteCompany,
  getAllCompany,
  updateCompany,
} from "@/action/company";
import { StateData } from "@/utility/getStateCode";
import Pagination from "../_components/Pagination";

const companySchema = z.object({
  shotName: z.string().min(2, "Short name is required"),
  name: z.string().min(2, "Name is required"),
  billingAddress: z.string().min(2, "Billing address is required"),
  billingState: z.enum(
    Object.keys(StateData).filter((k): k is string => typeof k === "string") as [string, ...string[]],
    { errorMap: () => ({ message: "Billing state is required" }) }
  ),
  shippingState: z.enum(
    Object.keys(StateData).filter((k): k is string => typeof k === "string") as [string, ...string[]],
    { errorMap: () => ({ message: "Shipping state is required" }) }
  ),
  gstNo: z.string().min(2, "Billing GST number is required"),
  shippingAddress: z.string().min(2, "Shipping address is required"),
  shippingName: z.string().min(2, "Shipping Name is required"),
  shipping_gstNo: z.string().min(2, "Shipping GST number is required"),
  stringNumber: z.string().min(1, "String number is required"),
  PONumber: z.string().min(1, "PO Number is required"),
  sheetUrl: z.string().min(1, "sheet url is required"),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyTable() {
  const [companies, setCompanies] = useState<companyDetail[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selectedCompany, setSelectedCompany] = useState<companyDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const updateData = async () => {
    const data = await getAllCompany();
    setCompanies(data);
  };

  const openFormModal = (company: companyDetail | null = null) => {
    setIsEditing(!!company);
    setSelectedCompany(company);
    reset(
      company
        ? {
            shotName: company.shotName,
            name: company.name,
            billingAddress: company.billingAddress,
            billingState: company.billingState,
            gstNo: company.billing_gstNo,
            shippingAddress: company.shippingAddress,
            shippingState: company.shippingState,
            shipping_gstNo: company.shipping_gstNo,
            stringNumber: company.stringNumber,
            PONumber: company.PONumber,
            sheetUrl: company.sheetUrl ?? "",
            shippingName: company.shipping_Name ?? "",
          }
        : {
            shotName: "", name: "", billingAddress: "", billingState: "",
            gstNo: "", shippingAddress: "", shippingState: "", shipping_gstNo: "",
            stringNumber: "", PONumber: "", shippingName: "",
          }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = async (data: CompanyFormData) => {
    setLoading(true);
    const payload = {
      shotName: data.shotName, name: data.name,
      billingAddress: data.billingAddress, billingState: data.billingState,
      billing_gstNo: data.gstNo, shippingAddress: data.shippingAddress,
      shippingState: data.shippingState, shipping_gstNo: data.shipping_gstNo,
      stringNumber: data.stringNumber, PONumber: data.PONumber,
      sheetUrl: data.sheetUrl, shipping_Name: data.shippingName,
    } as companyDetail;
    if (isEditing && selectedCompany) {
      await updateCompany(selectedCompany.id, payload);
    } else {
      await AddCompany(payload);
    }
    await updateData();
    setLoading(false);
    closeModal();
  };

  const confirmDelete = (company: companyDetail) => {
    setSelectedCompany(company);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (selectedCompany) {
      await deleteCompany(selectedCompany.id);
      await updateData();
    }
    setIsDeleteConfirmOpen(false);
  };

  useEffect(() => { updateData(); }, []);
  console.log(errors);

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-green-900 tracking-tight">Companies</h1>
          <p className="text-xs text-green-600 mt-0.5">Manage company billing & shipping details · BioTrend Energy</p>
        </div>
        <button className="btn btn-green" onClick={() => openFormModal()}>
          + Add Company
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
              {["Short Name","Name","Billing Address","Billing State","Billing GST","Shipping Name","Shipping Address","Shipping State","Shipping GST","BTE Series","PO Number","Sheet","Actions"].map((h) => (
                <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-green-700 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-green-100/60">
            {companies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((company) => (
              <tr key={company.id} className="bg-white/30 hover:bg-white/60 transition-colors duration-100">
                <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{company.shotName}</td>
                <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{company.name}</td>
                <td className="px-4 py-3.5 text-gray-500 max-w-[160px] truncate">{company.billingAddress}</td>
                <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{company.billingState}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">{company.billing_gstNo}</td>
                <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{company.shipping_Name}</td>
                <td className="px-4 py-3.5 text-gray-500 max-w-[160px] truncate">{company.shippingAddress}</td>
                <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{company.shippingState}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">{company.shipping_gstNo}</td>
                <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{company.stringNumber}</td>
                <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{company.PONumber}</td>
                <td className="px-4 py-3.5">
                  <a
                    href={company.sheetUrl ?? ""}
                    target={`_blank_${company.id}`}
                    className="text-xs font-medium text-green-600 hover:text-green-800 underline underline-offset-2"
                  >
                    Link
                  </a>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/70 text-gray-600 ring-1 ring-gray-200 hover:bg-white hover:text-gray-900 transition-all duration-150 shadow-sm"
                      onClick={() => openFormModal(company)}
                    >
                      Update
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 ring-1 ring-red-200 hover:bg-red-100 transition-all duration-150 shadow-sm"
                      onClick={() => confirmDelete(company)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={13} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={Math.ceil(companies.length / PAGE_SIZE)}
        onPageChange={setPage}
        totalItems={companies.length}
        pageSize={PAGE_SIZE}
      />

      {/* Add/Update Modal */}
      {isModalOpen && (
        <dialog open className="modal modal-open">
          <div
            className="modal-box border border-white/60"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)" }}
          >
            <h3 className="font-bold text-lg text-green-900 mb-4">
              {isEditing ? "Update" : "Add"} Company
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {[
                { name: "shotName", label: "Short Name" },
                { name: "name", label: "Name" },
                { name: "billingAddress", label: "Billing Address" },
                { name: "billingState", label: "Billing State" },
                { name: "gstNo", label: "Billing GST Number" },
                { name: "shippingName", label: "Shipping Name" },
                { name: "shippingAddress", label: "Shipping Address" },
                { name: "shippingState", label: "Shipping State" },
                { name: "shipping_gstNo", label: "Shipping GST Number" },
                { name: "stringNumber", label: "String Number" },
                { name: "sheetUrl", label: "Sheet URL" },
                { name: "PONumber", label: "PO Number" },
              ].map(({ name, label }) => (
                <div key={name} className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-700">{label}</span>
                  </label>
                  {name === "billingState" || name === "shippingState" ? (
                    <select
                      {...register(name as keyof CompanyFormData)}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select State</option>
                      {Object.keys(StateData).map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...register(name as keyof CompanyFormData)}
                      className="input input-bordered w-full"
                    />
                  )}
                  {errors[name as keyof CompanyFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[name as keyof CompanyFormData]?.message}
                    </p>
                  )}
                </div>
              ))}
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
              Are you sure you want to delete <strong>{selectedCompany?.name}</strong>?
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
