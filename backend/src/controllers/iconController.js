const uploadIcon = async (req, res) => {
  res.status(201).json({
    success: true,
    data: { icon: { id: 'dummy-icon', ...req.body } }
  });
};

const getAllIcons = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { icons: [] }
  });
};

const getIconById = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { icon: { id: req.params.id } }
  });
};

const deleteIcon = async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Icon ${req.params.id} deleted successfully`
  });
};

module.exports = {
  uploadIcon,
  getAllIcons,
  getIconById,
  deleteIcon
};