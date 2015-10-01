
function SecurityGroupsTab(id)
{
    Tab.call(this, id, Constants.URL__SECURITY_GROUPS_VIEW_MODEL);
}

SecurityGroupsTab.prototype = new Tab();

SecurityGroupsTab.prototype.constructor = SecurityGroupsTab;

SecurityGroupsTab.prototype.initialize = function()
{
    Tab.prototype.initialize.call(this);

    this.securityGroupsRulesTable = Table.createTable("SecurityGroupsRules", this.getSecurityGroupsRulesColumns(), [[0, "asc"], [1, "asc"]], null, null, null, null);
};

SecurityGroupsTab.prototype.getInitialSort = function()
{
    return [[1, "asc"]];
};

SecurityGroupsTab.prototype.getColumns = function()
{
    return [
               {
                   "title":     Tab.prototype.formatCheckboxHeader(this.id),
                   "type":      "html",
                   "width":     "2px",
                   "orderable": false,
                   "render":    $.proxy(function(value, type, item)
                   {
                       return this.formatCheckbox(item[1], value);
                   },
                   this),
               },
               {
                   "title":  "Name",
                   "width":  "200px",
                   "render": Format.formatSecurityGroupString
               },
               {
                   "title":  "GUID",
                   "width":  "200px",
                   "render": Format.formatString
               },
               {
                   "title":  "Created",
                   "width":  "180px",
                   "render": Format.formatString
               },
               {
                   "title":  "Updated",
                   "width":  "180px",
                   "render": Format.formatString
               },
               {
                   "title":  "Staging Default",
                   "width":  "60px",
                   "render": Format.formatBoolean
               },
               {
                   "title":  "Running Default",
                   "width":  "60px",
                   "render": Format.formatBoolean
               },
               {
                   "title":     "Spaces",
                   "width":     "60px",
                   "className": "cellRightAlign",
                   "render":    Format.formatNumber
               },
           ];
};

SecurityGroupsTab.prototype.getActions = function()
{
    return [
               {
                   text: "Delete",
                   click: $.proxy(function()
                   {
                       this.deleteChecked("Are you sure you want to delete the selected security groups?",
                                          "Delete",
                                          "Deleting Security Groups",
                                          Constants.URL__SECURITY_GROUPS,
                                          "");
                   },
                   this)
               }
           ];
};

SecurityGroupsTab.prototype.getSecurityGroupsRulesColumns = function()
{
    return [
               {
                   "title":  "Protocol",
                   "width":  "60px",
                   "render": function(name, type, row)
                   {
                       if (Format.doFormatting(type))
                       {
                           return name +
                                  "</a><img onclick='SecurityGroupsTab.prototype.displaySecurityGroupRuleDetail(event, \"" + 
                                  row[6] + 
                                  "\");' src='images/details.gif' style='margin-left: 5px; vertical-align: middle;' height=14>";
                       }
               
                       return name;
                   }
               },
               {
                   "title":  "Destination",
                   "width":  "200px",
                   "render": Format.formatSecurityGroupString
               },
               {
                   "title":  "Log",
                   "width":  "40px",
                   "render": Format.formatBoolean
               },
               {
                   "title":  "Ports",
                   "width":  "200px",
                   "render": Format.formatSecurityGroupString
               },
               {
                   "title":  "Type",
                   "width":  "40px",
                   "className": "cellRightAlign",
                   "render": Format.formatNumber
               },
               {
                   "title":  "Code",
                   "width":  "40px",
                   "className": "cellRightAlign",
                   "render": Format.formatNumber
               }
           ];
};

SecurityGroupsTab.prototype.hideDetails = function()
{
    Tab.prototype.hideDetails.call(this);
    
    $("#SecurityGroupsRulesTableContainer").hide();
};

SecurityGroupsTab.prototype.clickHandler = function()
{
    this.itemClicked(-1, 2);
};

SecurityGroupsTab.prototype.showDetails = function(table, securityGroup, row)
{
    this.addJSONDetailsLinkRow(table, "Name", Format.formatString(securityGroup.name), securityGroup, true);
    this.addPropertyRow(table, "GUID", Format.formatString(securityGroup.guid));
    this.addPropertyRow(table, "Created", Format.formatDateString(securityGroup.created_at));
    this.addRowIfValue(this.addPropertyRow, table, "Updated", Format.formatDateString, securityGroup.updated_at);
    this.addRowIfValue(this.addPropertyRow, table, "Staging Default", Format.formatBoolean, securityGroup.staging_default);
    this.addRowIfValue(this.addPropertyRow, table, "Running Default", Format.formatBoolean, securityGroup.running_default);
    
    if (row[7] != null)
    {
        this.addFilterRow(table, "Spaces", Format.formatNumber(row[7]), securityGroup.guid, AdminUI.showSecurityGroupsSpaces);
    }

    if (securityGroup.rules != null)
    {
        try
        {
            var securityGroupRules = jQuery.parseJSON(securityGroup.rules);
            
            if (securityGroupRules != null)
            {
                // Have to show the table prior to populating for its sizing to work correctly.
                $("#SecurityGroupsRulesTableContainer").show();

                var securityGroupRulesTableData = [];

                for (var securityGroupRuleIndex = 0; securityGroupRuleIndex < securityGroupRules.length; securityGroupRuleIndex++)
                {
                    var securityGroupRule = securityGroupRules[securityGroupRuleIndex];
                    
                    var securityGroupRuleRow = [];

                    securityGroupRuleRow.push(securityGroupRule.protocol);
                    securityGroupRuleRow.push(securityGroupRule.destination);
                    securityGroupRuleRow.push(securityGroupRule.log);
                    securityGroupRuleRow.push(securityGroupRule.ports);
                    securityGroupRuleRow.push(securityGroupRule.type);
                    securityGroupRuleRow.push(securityGroupRule.code);
                    
                    // Need both the index and the actual object in the table
                    securityGroupRuleRow.push(securityGroupRuleIndex);
                    securityGroupRuleRow.push(securityGroupRule);

                    securityGroupRulesTableData.push(securityGroupRuleRow);
                }

                this.securityGroupsRulesTable.api().clear().rows.add(securityGroupRulesTableData).draw();
            }
        }
        catch (error)
        {
        }
    }
    
    SecurityGroupsTab.prototype.displaySecurityGroupRuleDetail = function(event, rowIndex)
    {
        var row = $("#SecurityGroupsRulesTable").DataTable().row(rowIndex).data();

        var securityGroupRule = row[7];

        Utilities.windowOpen(securityGroupRule);

        event.stopPropagation();

        return false;
    };
};