"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  Building2,
  Users,
  Sparkles,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface LocationItem {
  id: string;
  name: string;
  building: string;
  floor: string;
  roomCode: string;
  capacity: number;
  roomType: "Classroom" | "Science Lab" | "Computer Lab" | "Library" | "Auditorium" | "Staff Room" | "Office" | "Sports Hall";
  facilities: string[];
}

const DEFAULT_LOCATIONS: LocationItem[] = [
  {
    id: "1",
    name: "Room 101 - Grade 10A",
    building: "Academic Block A",
    floor: "1st Floor",
    roomCode: "A-101",
    capacity: 45,
    roomType: "Classroom",
    facilities: ["Smart Board", "Projector", "CCTV", "WiFi"],
  },
  {
    id: "2",
    name: "Room 102 - Grade 10B",
    building: "Academic Block A",
    floor: "1st Floor",
    roomCode: "A-102",
    capacity: 45,
    roomType: "Classroom",
    facilities: ["Smart Board", "Projector", "CCTV"],
  },
  {
    id: "3",
    name: "Physics & Chemistry Lab",
    building: "Science & Tech Wing",
    floor: "2nd Floor",
    roomCode: "SCI-201",
    capacity: 50,
    roomType: "Science Lab",
    facilities: ["Safety Showers", "Projector", "Gas Outlets", "WiFi"],
  },
  {
    id: "4",
    name: "Advanced Computer Lab",
    building: "Science & Tech Wing",
    floor: "2nd Floor",
    roomCode: "CS-202",
    capacity: 60,
    roomType: "Computer Lab",
    facilities: ["Air Conditioned", "High-speed WiFi", "Projector", "UPS Backup"],
  },
  {
    id: "5",
    name: "Central Library & Resource Hub",
    building: "Main Administration Block",
    floor: "Ground Floor",
    roomCode: "LIB-01",
    capacity: 120,
    roomType: "Library",
    facilities: ["RFID Kiosk", "Air Conditioned", "WiFi", "Quiet Study Pods"],
  },
  {
    id: "6",
    name: "Grand Auditorium",
    building: "Cultural & Arts Block",
    floor: "Ground Floor",
    roomCode: "AUD-01",
    capacity: 450,
    roomType: "Auditorium",
    facilities: ["Acoustic Sound System", "Stage Lighting", "Air Conditioned", "Projector"],
  },
  {
    id: "7",
    name: "Senior Faculty Lounge",
    building: "Main Administration Block",
    floor: "1st Floor",
    roomCode: "ADM-105",
    capacity: 30,
    roomType: "Staff Room",
    facilities: ["Air Conditioned", "WiFi", "Coffee Station", "Lockers"],
  },
];

const AVAILABLE_FACILITIES = [
  "Smart Board",
  "Projector",
  "Air Conditioned",
  "High-speed WiFi",
  "CCTV",
  "Acoustic Sound System",
  "UPS Backup",
  "Safety Showers",
];

export default function LocationSetupPage() {
  const [locations, setLocations] = React.useState<LocationItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [buildingFilter, setBuildingFilter] = React.useState<string>("All");
  const [typeFilter, setTypeFilter] = React.useState<string>("All");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<LocationItem | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<{
    name: string;
    building: string;
    floor: string;
    roomCode: string;
    capacity: number;
    roomType: LocationItem["roomType"];
    facilities: string[];
  }>({
    name: "",
    building: "Academic Block A",
    floor: "1st Floor",
    roomCode: "",
    capacity: 40,
    roomType: "Classroom",
    facilities: ["Smart Board", "Projector"],
  });

  const [formErrors, setFormErrors] = React.useState<{
    name?: string;
    building?: string;
    roomCode?: string;
    capacity?: string;
  }>({});

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_locations_v3");
    if (saved) {
      try {
        setLocations(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setLocations(DEFAULT_LOCATIONS);
  }, []);

  const saveLocations = (newItems: LocationItem[]) => {
    setLocations(newItems);
    localStorage.setItem("erp_master_locations_v3", JSON.stringify(newItems));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormErrors({});
    setFormData({
      name: "",
      building: "Academic Block A",
      floor: "1st Floor",
      roomCode: "",
      capacity: 40,
      roomType: "Classroom",
      facilities: ["Smart Board", "Projector", "WiFi"],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: LocationItem) => {
    setEditingItem(item);
    setFormErrors({});
    setFormData({
      name: item.name,
      building: item.building,
      floor: item.floor,
      roomCode: item.roomCode,
      capacity: item.capacity,
      roomType: item.roomType,
      facilities: [...item.facilities],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;
    saveLocations(locations.filter((loc) => loc.id !== id));
  };

  const toggleFacility = (facility: string) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== facility)
          : [...prev.facilities, facility],
      };
    });
  };

  const validateLocationForm = () => {
    const errors: { name?: string; building?: string; roomCode?: string; capacity?: string } = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = "Room/location name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!formData.building.trim()) {
      errors.building = "Building name is required.";
    }

    const trimmedRoomCode = formData.roomCode.trim().toUpperCase();
    if (!trimmedRoomCode) {
      errors.roomCode = "Room code is required.";
    } else {
      const isDuplicateCode = locations.some(
        (loc) =>
          loc.roomCode.toUpperCase() === trimmedRoomCode &&
          loc.id !== editingItem?.id
      );
      if (isDuplicateCode) {
        errors.roomCode = `Room code "${trimmedRoomCode}" is already in use.`;
      }
    }

    const capNum = Number(formData.capacity);
    if (!capNum || isNaN(capNum) || capNum <= 0) {
      errors.capacity = "Capacity must be a positive number (> 0).";
    } else if (capNum > 2000) {
      errors.capacity = "Capacity cannot exceed 2000 seats.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLocationForm()) {
      return;
    }

    if (editingItem) {
      const updated = locations.map((loc) =>
        loc.id === editingItem.id
          ? {
              ...loc,
              name: formData.name.trim(),
              building: formData.building.trim(),
              floor: formData.floor.trim(),
              roomCode: formData.roomCode.trim().toUpperCase(),
              capacity: Number(formData.capacity) || 0,
              roomType: formData.roomType,
              facilities: formData.facilities,
            }
          : loc
      );
      saveLocations(updated);
    } else {
      const newItem: LocationItem = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        building: formData.building.trim(),
        floor: formData.floor.trim(),
        roomCode: formData.roomCode.trim().toUpperCase(),
        capacity: Number(formData.capacity) || 0,
        roomType: formData.roomType,
        facilities: formData.facilities,
      };
      saveLocations([...locations, newItem]);
    }
    setIsModalOpen(false);
  };

  // Filtered list
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.floor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBuilding = buildingFilter === "All" || loc.building === buildingFilter;
    const matchesType = typeFilter === "All" || loc.roomType === typeFilter;

    return matchesSearch && matchesBuilding && matchesType;
  });

  const uniqueBuildings = Array.from(new Set(locations.map((l) => l.building)));
  const uniqueTypes = Array.from(new Set(locations.map((l) => l.roomType)));
  const totalCapacity = locations.reduce((sum, l) => sum + l.capacity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      <ErpHeader />
      <ErpTopNav activeModuleId="master-setup" />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)] font-medium">
          <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="font-bold text-[var(--brand-primary)]">Location Setup</span>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-red-50 text-[var(--brand-primary)] flex items-center justify-center font-bold">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Total Rooms</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{locations.length}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Seating Capacity</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{totalCapacity.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Campus Blocks</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{uniqueBuildings.length}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Room Categories</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{uniqueTypes.length}</div>
            </div>
          </div>
        </div>

        {/* Card Header */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-[6px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Locations & Rooms
                </h1>
                <p className="text-xs text-[var(--neutral-500)]">
                  Create and manage campus blocks, floors, laboratories, and classrooms
                </p>
              </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search room or code..."
                  className="h-8 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] w-40 sm:w-48"
                />
              </div>

              {/* Building filter */}
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-medium text-[var(--neutral-700)] cursor-pointer"
              >
                <option value="All">All Blocks</option>
                {uniqueBuildings.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-medium text-[var(--neutral-700)] cursor-pointer"
              >
                <option value="All">All Room Types</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Location</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {filteredLocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Room / Location</th>
                    <th className="py-2.5 px-4">Room Code</th>
                    <th className="py-2.5 px-4">Building / Block</th>
                    <th className="py-2.5 px-4">Floor</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4 text-center">Capacity</th>
                    <th className="py-2.5 px-4">Facilities</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filteredLocations.map((loc, index) => (
                    <tr key={loc.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 text-center text-[var(--neutral-500)] font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">{loc.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-[var(--neutral-100)] text-[var(--neutral-800)] border border-[var(--border-default)]">
                          {loc.roomCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--neutral-700)] font-medium">
                        {loc.building}
                      </td>
                      <td className="py-3 px-4 text-[var(--neutral-600)]">{loc.floor}</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold border",
                          loc.roomType === "Classroom" && "bg-blue-50 text-blue-700 border-blue-200",
                          loc.roomType === "Science Lab" && "bg-purple-50 text-purple-700 border-purple-200",
                          loc.roomType === "Computer Lab" && "bg-cyan-50 text-cyan-700 border-cyan-200",
                          loc.roomType === "Library" && "bg-amber-50 text-amber-700 border-amber-200",
                          loc.roomType === "Auditorium" && "bg-rose-50 text-rose-700 border-rose-200",
                          loc.roomType === "Staff Room" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                          loc.roomType === "Office" && "bg-neutral-50 text-neutral-700 border-neutral-200",
                          loc.roomType === "Sports Hall" && "bg-orange-50 text-orange-700 border-orange-200"
                        )}>
                          {loc.roomType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold font-mono text-[var(--text-primary)]">
                        {loc.capacity}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {loc.facilities.map((fac) => (
                            <span
                              key={fac}
                              className="px-1.5 py-0.2 bg-[var(--neutral-100)] text-[var(--neutral-600)] rounded text-[9px] border border-[var(--border-default)]"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(loc)}
                            title="Edit"
                            className="p-1.5 rounded text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(loc.id)}
                            title="Delete"
                            className="p-1.5 rounded text-[var(--neutral-600)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <MapPin className="h-10 w-10 text-[var(--neutral-400)] mx-auto" />
              <p className="text-xs font-medium text-[var(--neutral-500)]">
                No locations match your search filters. Click &ldquo;+ Add Location&rdquo; to create one.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-xl bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  {editingItem ? "Edit Location" : "Add New Location"}
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  {editingItem ? "Update classroom/facility details" : "Create a new classroom, laboratory, or facility"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[var(--neutral-400)] hover:text-black transition-colors rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Location / Room Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="e.g., Room 101 - Grade 10A, Physics Lab, Central Library"
                  className={cn(
                    "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                    formErrors.name
                      ? "border-red-500 bg-red-50/10"
                      : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                  )}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 font-medium">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Building / Campus Block <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => {
                      setFormData({ ...formData, building: e.target.value });
                      if (formErrors.building) setFormErrors({ ...formErrors, building: undefined });
                    }}
                    placeholder="e.g., Academic Block A, Science Wing"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      formErrors.building
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.building && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.building}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Floor <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="4th Floor">4th Floor</option>
                    <option value="Basement">Basement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Room Code / Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.roomCode}
                    onChange={(e) => {
                      setFormData({ ...formData, roomCode: e.target.value });
                      if (formErrors.roomCode) setFormErrors({ ...formErrors, roomCode: undefined });
                    }}
                    placeholder="e.g., A-101, SCI-201"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono uppercase transition-colors",
                      formErrors.roomCode
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.roomCode && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.roomCode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Seating Capacity <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => {
                      setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 });
                      if (formErrors.capacity) setFormErrors({ ...formErrors, capacity: undefined });
                    }}
                    placeholder="40"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                      formErrors.capacity
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.capacity && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.capacity}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Room Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value as any })}
                    className="w-full h-9 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Science Lab">Science Lab</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Library">Library</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Staff Room">Staff Room</option>
                    <option value="Office">Office</option>
                    <option value="Sports Hall">Sports Hall</option>
                  </select>
                </div>
              </div>

              {/* Facilities / Amenities Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Available Facilities & Equipment
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAILABLE_FACILITIES.map((facility) => {
                    const isChecked = formData.facilities.includes(facility);
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleFacility(facility)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-[4px] text-xs font-medium border text-left flex items-center gap-2 transition-colors cursor-pointer",
                          isChecked
                            ? "bg-red-50 border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold"
                            : "bg-[var(--neutral-50)] border-[var(--border-default)] text-[var(--neutral-700)] hover:bg-[var(--neutral-100)]"
                        )}
                      >
                        <span className={cn(
                          "h-3.5 w-3.5 rounded-xs flex items-center justify-center border text-[9px]",
                          isChecked ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]" : "border-[var(--neutral-400)] bg-white"
                        )}>
                          {isChecked ? "✓" : ""}
                        </span>
                        <span className="truncate">{facility}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[var(--neutral-700)] bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-50)] rounded-[4px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[var(--brand-primary)] hover:bg-red-700 text-white rounded-[4px] shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
