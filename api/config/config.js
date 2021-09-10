const status = {
  pending: 1,
  approved: 2,
};
const permissions = {
  //roles
  can_add_roles: "can_add_roles",
  can_edit_roles: "can_edit_roles",
  can_delete_roles: "can_delete_roles",
  can_view_roles: "can_view_roles",
  can_approve_roles: "can_approve_roles",
  //printer types
  can_add_printer_types: "can_add_printer_types",
  can_edit_printer_types: "can_edit_printer_types",
  can_view_printer_types: "can_view_printer_types",
  can_delete_printer_types: "can_delete_printer_types",
  can_approve_printer_types: "can_approve_printer_types",
  //printers
  can_view_printers: "can_view_printers",
  can_add_printers: "can_add_printers",
  can_edit_printers: "can_edit_printers",
  can_delete_printers: "can_delete_printers",
  can_approve_printers: "can_approve_printers",
  can_export_printers: "can_export_printers",
  //print outs
  can_view_print_outs: "can_view_print_outs",
  can_view_all_print_outs: "can_view_all_print_outs",
  can_add_print_outs: "can_add_print_outs",
  can_edit_print_outs: "can_edit_print_outs",
  can_export_print_outs: "can_export_print_outs",
  can_delete_print_outs: "can_delete_print_outs",
  can_approve_print_outs: "can_approve_print_outs",
  can_view_billing: "can_view_billing",
  can_export_billing: "can_export_billing",
  //users:
  can_view_users: "can_view_users",
  can_add_users: "can_add_users",
  can_delete_users: "can_delete_users",
  can_edit_users: "can_edit_users",
};

module.exports = { permissions, status };
