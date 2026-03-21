const AppError = require("../../utils/appError");
const fileService = require("../../services/file.service");
const serviceRepository = require("../../repositories/service.repository");
const designRepository = require("../../repositories/design.repository");

const sanitizeService = (service) => ({
  id: service._id,
  name: service.name,
  description: service.description,
  imageUrl: service.imageUrl || "",
  status: service.status,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
});

const toLocalizedText = (text) => (typeof text === "string" ? text.trim() : "");

const listServices = async ({ search = "", status, page = 1, limit = 20 } = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;
  const skip = (safePage - 1) * safeLimit;

  const [services, total] = await Promise.all([
    serviceRepository.findAll({ search, status, skip, limit: safeLimit }),
    serviceRepository.countAll({ search, status }),
  ]);

  return {
    items: services.map(sanitizeService),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const createService = async ({ payload, file }) => {
  const data = {
    name: payload.name.trim(),
    description: toLocalizedText(payload.description),
    status: payload.status || "active",
  };

  if (file) {
    const uploaded = await fileService.uploadImageBuffer(file.buffer, "catalog/services");
    data.imageUrl = uploaded.secure_url;
    data.imagePublicId = uploaded.public_id;
  }

  const service = await serviceRepository.create(data);
  return sanitizeService(service);
};

const getServiceById = async (id) => {
  const service = await serviceRepository.findById(id);
  if (!service) {
    throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND");
  }
  return sanitizeService(service);
};

const updateService = async ({ id, payload, file }) => {
  const existing = await serviceRepository.findById(id);
  if (!existing) {
    throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND");
  }

  const patch = {};
  if (payload.name) {
    patch.name = payload.name.trim();
  }
  if (payload.description !== undefined) {
    patch.description = toLocalizedText(payload.description);
  }
  if (payload.status) {
    patch.status = payload.status;
  }

  if (file) {
    const uploaded = await fileService.uploadImageBuffer(file.buffer, "catalog/services");
    patch.imageUrl = uploaded.secure_url;
    patch.imagePublicId = uploaded.public_id;
    if (existing.imagePublicId) {
      await fileService.deleteImage(existing.imagePublicId);
    }
  }

  if (Object.keys(patch).length === 0) {
    throw new AppError("No fields provided to update", 400, "VALIDATION_ERROR");
  }

  const updated = await serviceRepository.updateById(id, patch);
  return sanitizeService(updated);
};

const updateServiceStatus = async ({ id, status }) => {
  const updated = await serviceRepository.updateById(id, { status });
  if (!updated) {
    throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND");
  }
  return sanitizeService(updated);
};

const deleteService = async (id) => {
  const service = await serviceRepository.softDeleteById(id);
  if (!service) {
    throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND");
  }
  if (service.imagePublicId) {
    await fileService.deleteImage(service.imagePublicId);
  }
};

const listActiveServices = async () => {
  const services = await serviceRepository.findActive({ sort: { name: 1 }, limit: 100 });
  const items = await Promise.all(
    services.map(async (service) => {
      const designCount = await designRepository.countForService({
        serviceId: service._id,
        serviceName: service.name,
      });
      return {
        id: service._id,
        name: service.name,
        imageUrl: service.imageUrl || "",
        designCount,
      };
    })
  );

  return items;
};

module.exports = {
  listServices,
  createService,
  getServiceById,
  updateService,
  updateServiceStatus,
  deleteService,
  listActiveServices,
};
