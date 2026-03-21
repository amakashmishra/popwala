const userRepository = require("../../repositories/user.repository");
const contractorRepository = require("../../repositories/contractor.repository");
const architectRepository = require("../../repositories/architect.repository");
const leadRepository = require("../../repositories/lead.repository");
const bannerRepository = require("../../repositories/banner.repository");

const DEFAULT_WINDOW_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ACTIVE_PROJECT_STAGES = ["new", "contacted", "site_visit", "quotation_sent"];

const toStartOfDay = (draft) => {
  const date = new Date(draft);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toEndOfDay = (draft) => {
  const date = new Date(draft);
  date.setHours(23, 59, 59, 999);
  return date;
};

const buildRanges = (startDate, endDate) => {
  const now = new Date();
  const end = endDate ? toEndOfDay(endDate) : toEndOfDay(now);
  let start;
  if (startDate) {
    start = toStartOfDay(startDate);
  } else {
    const fallback = new Date(end.getTime() - (DEFAULT_WINDOW_DAYS - 1) * MS_PER_DAY);
    start = toStartOfDay(fallback);
  }
  if (start > end) {
    start = toStartOfDay(end);
  }
  const durationDays = Math.max(Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1, 1);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = toStartOfDay(new Date(prevEnd.getTime() - (durationDays - 1) * MS_PER_DAY));
  return {
    currentStart: start,
    currentEnd: end,
    prevStart,
    prevEnd: toEndOfDay(prevEnd),
  };
};

const computePercent = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / previous) * 100);
};

const getDashboardStats = async ({ startDate, endDate } = {}) => {
  const { currentStart, currentEnd, prevStart, prevEnd } = buildRanges(startDate, endDate);

  const [
    totalUsers,
    contractors,
    architects,
    totalLeads,
    totalDesigns,
  ] = await Promise.all([
    userRepository.countAllWithFilters(),
    contractorRepository.countAll(),
    architectRepository.countAll(),
    leadRepository.countAll(),
    bannerRepository.countAll(),
  ]);

  const [
    usersCurrent,
    usersPrevious,
    contractorsNew,
    architectsNew,
    designsCurrent,
    leadsCurrent,
    leadsPrevious,
    activeProjects,
    completedProjects,
    revenueCurrent,
    revenuePrevious,
  ] = await Promise.all([
    userRepository.countCreatedBetween(currentStart, currentEnd),
    userRepository.countCreatedBetween(prevStart, prevEnd),
    contractorRepository.countCreatedBetween(currentStart, currentEnd),
    architectRepository.countCreatedBetween(currentStart, currentEnd),
    bannerRepository.countCreatedBetween(currentStart, currentEnd),
    leadRepository.countCreatedBetween(currentStart, currentEnd),
    leadRepository.countCreatedBetween(prevStart, prevEnd),
    leadRepository.countByStages(ACTIVE_PROJECT_STAGES, currentStart, currentEnd),
    leadRepository.countByStages(["completed"], currentStart, currentEnd),
    leadRepository.sumBudgetsByStages(["completed"], currentStart, currentEnd),
    leadRepository.sumBudgetsByStages(["completed"], prevStart, prevEnd),
  ]);

  const usersGrowth = computePercent(usersCurrent, usersPrevious);
  const leadsConversion = computePercent(leadsCurrent, leadsPrevious);
  const revenueGrowth = computePercent(revenueCurrent, revenuePrevious);
  const totalProjectsForRate = activeProjects + completedProjects;
  const satisfactionRate = totalProjectsForRate === 0 ? 0 : Math.round((completedProjects / totalProjectsForRate) * 100);

  return {
    totalUsers,
    usersGrowth,
    contractors,
    contractorsNew,
    architects,
    architectsNew,
    totalDesigns,
    designsThisRange: designsCurrent,
    totalLeads,
    leadsConversion,
    activeProjects,
    completedProjects,
    satisfactionRate,
    revenue: revenueCurrent,
    revenueGrowth,
  };
};

module.exports = {
  getDashboardStats,
};
