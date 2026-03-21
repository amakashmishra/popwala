const leadRepository = require("../../repositories/lead.repository");

const stageLabels = {
  new: "New",
  contacted: "Contacted",
  site_visit: "Site Visit",
  quotation_sent: "Quotation Sent",
  completed: "Completed",
  cancelled: "Cancelled",
};

const sanitizeLead = (lead) => ({
  id: lead._id,
  name: lead.name,
  projectType: lead.projectType,
  location: lead.location,
  stage: lead.stage,
  stageLabel: stageLabels[lead.stage] || "New",
  createdAt: lead.createdAt,
});

const listRecentLeads = async ({ limit = 5 } = {}) => {
  const leads = await leadRepository.findRecent({ limit });
  return leads.map(sanitizeLead);
};

module.exports = {
  listRecentLeads,
};
