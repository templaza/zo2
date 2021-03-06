/**
 * Zo2 (http://www.zo2framework.org)
 * A powerful Joomla template framework
 *
 * @link        http://www.zo2framework.org
 * @link        http://github.com/aploss/zo2
 * @author      Duc Nguyen <ducntv@gmail.com>
 * @author      Hiepvu <vqhiep2010@gmail.com>
 * @copyright   Copyright (c) 2013 APL Solutions (http://apl.vn)
 * @license     GPL v2
 */

var strategy = [
    [12], [6, 6], [4, 4, 4], [3, 3, 3, 3], [3, 3, 2, 2, 2], [2, 2, 2, 2, 2, 2]
];

var allColClass = 'col-md-1 col-md-2 col-md-3 col-md-4 col-md-5 col-md-6 col-md-7 col-md-8 col-md-9 col-md-10 col-md-11 col-md-12';
var allColOffset = 'col-md-offset-0 col-md-offset-1 col-md-offset-2 col-md-offset-3 col-md-offset-4 col-md-offset-5 col-md-offset-6 ' +
    'col-md-offset-7 col-md-offset-8 col-md-offset-9 col-md-offset-10 col-md-offset-11 col-md-offset-12';

var $ = jQuery.noConflict();

$(window).bind('load', function(){
//    var $tabsContainer = $('#myTabTabs');
//    var $tabContent = $('#myTabContent');
//    var $tab = $('<li class=""><a href="#layoutbuilder-container" data-toggle="tab">Layout Builder</a></li>');
//    $tab.appendTo($tabsContainer);
//
//    //add mega menu tab
//    var $tabMenu = $('<li class=""><a href="#megamenubuilder-container" data-toggle="tab">MegaMenu Builder</a></li>');
//    $tabMenu.appendTo($tabsContainer);
//    var $megamenuInner = $('#zo2-admin-megamenu').closest('.accordion-inner');
//    var $wrapMenu = $megamenuInner.closest('.accordion-group');
//    var $megaContainer = $('<div id="megamenubuilder-container" class="tab-pane" />');
//    $megaContainer.append($megamenuInner);
//    $megaContainer.appendTo($tabContent);
//    $wrapMenu.remove();
//
//   // add layout builder tab
//    var $layoutBuilder = $('#layoutbuilder-container');
//    var $layoutContainer = jQuery('#layoutbuilder-container').closest('.accordion-group');
//    $layoutBuilder.addClass('tab-pane').appendTo($tabContent);
//    $('#hfTemplateName').appendTo($layoutBuilder);
//    $('#hfLayoutName').appendTo($layoutBuilder);
//    $layoutContainer.remove();

    insertLogo();
    addIconToMenu();
    fixToolbarIcon();
});

jQuery(document).ready(function($){
    injectFormSubmit();
    //wrapForm();

    bindSortable();

    // bind event to generate row id
    $('#txtRowName').on('keyup', function (e){
        var $this = $(this);
        $('#txtRowId').val(generateSlug($this.val()));
    });

    //var width = $('#style-form').width() - 320;
    //$('#droppable-container').css('width', width);
    var layoutName = $('#hfLayoutName').val();
    var templateName = $('#hfTemplateName').val();

    //loadLayout(templateName, layoutName);

    $('#droppable-container').on('click', '.row-control-buttons > .duplicate', function() {
        var $this = $(this);
        var $parent = $this.closest('.zo2-row');
        var $container = $this.closest('.zo2-container, .sortable-col');
        var $row = jQuery('<div />').addClass('zo2-row sortable-row').insertAfter($parent);
        $row.attr('data-zo2-type', 'row');
        $row.attr('data-zo2-customClass', '');
        $row.attr('data-zo2-layout', 'fixed');
        var $meta = jQuery('<div class="col-md-12 row-control">' +
            '<div class="row-control-container">' +
            '<div class="row-name">(unnamed row)</div>' +
            '<div class="row-control-buttons">' +
            '<i class="icon-move row-control-icon dragger"></i>' +
            '<i class="icon-cogs row-control-icon settings"></i>' +
            '<i class="row-control-icon duplicate icon-align-justify"></i>' +
            '<i class="row-control-icon split icon-columns"></i>' +
            '<i class="row-control-icon delete icon-remove"></i>' +
            '</div></div>' +
            '<div class="col-container"></div></div>');
        $meta.appendTo($row);
    });

    $('#droppable-container').on('click', '.row-control-buttons > .split', function() {
        var $this = $(this);
        var $container = $this.closest('[data-zo2-type="row"]');
        var $colContainer = $container.find('>.col-md-12>.col-container');
        var $spans = $colContainer.find('>[data-zo2-type="span"]');
        var strategyNum = $spans.length;

        if ($spans.length > 5) return false;
        else
        {
            var selectedStrategy = strategy[strategyNum];
            var $span = jQuery('<div />').addClass('sortable-col');
            $span.attr('data-zo2-type', 'span');
            $span.attr('data-zo2-position', '');
            $span.attr('data-zo2-offset', 0);
            $span.attr('data-zo2-customClass', '');
            var metaHtml = '<div class="col-wrap"><div class="col-name">(none)</div>' +
                '<div class="col-control-buttons">' +
                '<i class="col-control-icon dragger icon-move"></i><i class="icon-cogs col-control-icon settings"></i>' +
                '<i class="col-control-icon add-row icon-align-justify"></i>' +
                '<i class="icon-remove col-control-icon delete"></i></div><div class="row-container"></div></div></div>';
            var $meta = jQuery(metaHtml);
            $meta.appendTo($span);
            /*
            var $spanContainer = jQuery('<div />').addClass('row-container zo2-row sortable-row');
            $spanContainer.appendTo($meta);
             */
            $span.appendTo($colContainer);

            // apply new span number
            $colContainer.find('>[data-zo2-type="span"]').each(function(index) {
                var $this = jQuery(this);
                $this.removeClass(allColClass);
                $this.addClass('col-md-' + selectedStrategy[index]);
                $this.attr('data-zo2-span', selectedStrategy[index]);
            });
        }
    });

    $('#droppable-container').on('click', '.row-control-buttons > .delete', function(){
        var $this = $(this);
        bootbox.confirm('Are you sure want to delete this row?', function(result) {
            if (result) $this.closest('.sortable-row').remove();
        });
    });

    $('#droppable-container').on('click', '.col-control-buttons > .delete', function() {
        var $this = $(this);

        bootbox.confirm('Are you sure want to delete this column?', function(result) {
            var $container = $this.closest('.col-container');
            if (result) $this.closest('.sortable-col').remove();
            rearrangeSpan($container);
        });
    });

    $('#droppable-container').on('click', '.col-control-buttons > .add-row', function() {
        var $this = $(this);
        var $container = $this.parents('.col-wrap').find('>.row-container');

        var $row = jQuery('<div />').addClass('zo2-row sortable-row').appendTo($container);
        $row.attr('data-zo2-type', 'row');
        $row.attr('data-zo2-customClass', '');
        $row.attr('data-zo2-layout', 'fixed');
        var $meta = jQuery('<div class="col-md-12 row-control"><div class="row-control-container"><div class="row-name">(unnamed row)' +
            '</div><div class="row-control-buttons"><i class="icon-move row-control-icon dragger">' +
            '</i><i class="icon-cogs row-control-icon settings"></i><i class="row-control-icon duplicate icon-align-justify">' +
            '</i><i class="row-control-icon split icon-columns" /><i class="row-control-icon delete icon-remove"></i></div></div></div>');
        $meta.appendTo($row);
        var $colContainer = jQuery('<div />').addClass('col-container row-fluid clearfix');
        $colContainer.appendTo($meta);
    });

    $('#droppable-container').on('click', '.row-control-buttons > .settings', function(){
        var $this = $(this);
        var $row = $this.closest('.sortable-row');
        var rowName = $row.find('>.row-control>.row-control-container>.row-name').text();
        var rowCustomClass = $row.attr('data-zo2-customClass');
        var rowLayout = $row.attr('data-zo2-layout');
        var rowId = $row.attr('data-zo2-id');
        if (!rowCustomClass) rowCustomClass = '';
        $.data(document.body, 'editingEl', $row);
        $('#txtRowName').val('').val(rowName);
        $('#txtRowCss').val('').val(rowCustomClass);
        $('#txtRowId').val(rowId);
        $('#ddlRowLayout').val(rowLayout).trigger("liszt:updated");
        $('#rowSettingsModal').modal('show');
    });

    $('#btnSaveRowSettings').on('click', function () {
        var $row = $.data(document.body, 'editingEl');
        $row.find('>.row-control>.row-control-container>.row-name').text($('#txtRowName').val());
        $row.attr('data-zo2-customClass', $('#txtRowCss').val());
        $row.attr('data-zo2-layout', $('#ddlRowLayout').val());
        $row.attr('data-zo2-id', $('#txtRowId').val());
        $('#rowSettingsModal').modal('hide');
        return false;
    });

    $('#droppable-container').on('click', '.col-control-buttons > .settings', function(){
        var $this = $(this);
        var $col = $this.closest('.sortable-col');
        $.data(document.body, 'editingEl', $col);
        var spanWidth = $col.attr('data-zo2-span');
        var spanPosition = $col.attr('data-zo2-position');
        var spanOffset = $col.attr('data-zo2-offset');
        var spanStyle = $col.attr('data-zo2-style');
        var customCss = $col.attr('data-zo2-customClass');
        var spanId = $col.attr('data-zo2-id');
        $('#dlColWidth').val(spanWidth).trigger("liszt:updated"); // trigger chosen to update its selected value, stupid old version
        $('#dlColPosition').val(spanPosition).trigger("liszt:updated");
        $('#ddlColOffset').val(spanOffset).trigger("liszt:updated");
        $('#ddlColStyle').val(spanStyle).trigger("liszt:updated");
        $('#txtColCss').val(customCss);
        $('#txtColId').val(spanId);
        $('#colSettingsModal').modal('show');
    });

    $('#btnSaveColSettings').on('click', function() {
        var $col = $.data(document.body, 'editingEl');
        $col.attr('data-zo2-span', $('#dlColWidth').val());
        $col.attr('data-zo2-offset', $('#ddlColOffset').val());
        $col.attr('data-zo2-style', $('#ddlColStyle').val());
        $col.attr('data-zo2-customClass', $('#txtColCss').val());
        $col.attr('data-zo2-id', $('#txtColId').val());
        var colName = $('#dlColPosition').val().length > 0 ? $('#dlColPosition').val() : '(none)';
        $col.removeClass(allColClass).addClass('col-md-' + $('#dlColWidth').val());
        $col.removeClass(allColOffset).addClass('col-md-offset-' + $('#ddlColOffset').val());
        $col.attr('data-zo2-position', $('#dlColPosition').val());
        $col.find('>.col-wrap>.col-name').text(colName);
        $('#colSettingsModal').modal('hide');
        return false;
    });
});

var bindSortable = function () {
    // thêm > vào items
    jQuery('#droppable-container > .zo2-container').sortable({
        items: '>.sortable-row',
        handle: '>.row-control>.row-control-container>.row-control-buttons>.row-control-icon.dragger',
        containment: 'parent',
        tolerance: 'pointer',
        forcePlaceholderSize: true,
        axis: 'y'
    });

    jQuery('.sortable-row').sortable({
        items: '>.row-control>.col-container>.sortable-col',
        //connectWith: '>.sortable-row',
        handle: '>.col-wrap>.col-control-buttons>.col-control-icon.dragger',
        containment: 'parent',
        tolerance: "pointer",
        helper: 'clone',
        axis: 'x'
    });
};

var generateJson = function() {
    var $rootParent = jQuery('#droppable-container .zo2-container');
    var json = [];
    $rootParent.find('>[data-zo2-type="row"]').each(function (){
        var itemJson = generateItemJson(jQuery(this));
        if (itemJson != null) json.push(itemJson);
    });

    return JSON.stringify(json);
};

var generateItemJson = function($item) {
    var result = null;
    var $childrenContainer = null;
    if ($item.attr('data-zo2-type') == 'row') {
        result = {
            type: "row",
            layout: $item.attr('data-zo2-layout'),
            name: $item.find('> .row-control > .row-control-container > .row-name').text(),
            customClass: $item.attr('data-zo2-customClass'),
            id: $item.attr('data-zo2-id') ? $item.attr('data-zo2-id') : '',
            children: []
        };

        $childrenContainer = $item.find('> .row-control > .col-container');

        $childrenContainer.find('> [data-zo2-type]').each(function() {
            var childItem = generateItemJson(jQuery(this));
            result.children.push(childItem);
        });
    }
    else if ($item.attr('data-zo2-type') == 'span') {
        result = {
            type: "col",
            name: $item.find('> .col-wrap > .col-name').text(),
            position: $item.attr('data-zo2-position'),
            span: parseInt($item.attr('data-zo2-span')),
            offset: parseInt($item.attr('data-zo2-offset')),
            customClass: $item.attr('data-zo2-customClass') ? $item.attr('data-zo2-customClass') : '',
            style: $item.attr('data-zo2-style'),
            id: $item.attr('data-zo2-id') ? $item.attr('data-zo2-id') : '',
            children: []
        };

        $childrenContainer = $item.find('> .col-wrap > .row-container');

        $childrenContainer.find('> [data-zo2-type]').each(function() {
            console.log($(this));
            var childItem = generateItemJson(jQuery(this));
            result.children.push(childItem);
        });
    }

    return result;
};

var rearrangeSpan = function ($container){
    var $ = jQuery;
    var $spans = $container.find('>[data-zo2-type="span"]');
    if ($spans.length > 0) {
        var width = 0;
        if ($spans.length == 1) {
            width = 12 - parseInt($spans.attr('data-zo2-offset'));
            if (width > 0) {
                $spans.removeClass(allColClass);
                $spans.addClass('col-md-' + width);
                $spans.attr('data-zo2-span', width);
            }
        }
        else
        {
            var $lastSpan = $spans.eq($spans.length - 1);
            var totalWidth = 0;
            for(var i = 0, total = $spans.length - 1; i < total; i++) {
                var $currentSpan = $spans.eq(i);
                totalWidth += parseInt($currentSpan.attr('data-zo2-offset')) + parseInt($currentSpan.attr('data-zo2-span'));
            }

            width = 12 - totalWidth;
            if (width > 0) {
                $lastSpan.removeClass(allColClass);
                $lastSpan.addClass('col-md-' + width);
                $lastSpan.attr('data-zo2-span', width);
            }
        }
    }
};
var addIconToMenu = function() {
    var $ = jQuery;
    $('#myTabTabs').find('a').eq(0).html('<i class="icon-info" /> Overview');
    $('#myTabTabs').find('a').eq(1).html('<i class="icon-cog" /> General Options');
    $('#myTabTabs').find('a').eq(2).html('<i class="icon-th" /> Layout Builder');
    $('#myTabTabs').find('a').eq(3).html('<i class="icon-list-alt" /> Mega Menus');
    $('#myTabTabs').find('a').eq(4).html('<i class="icon-edit-sign" /> Assignment');
    $('#myTabTabs').find('a').eq(5).html('<i class="icon-wrench" /> Advanced');
};

var insertLogo = function () {
    var $ = jQuery;
    var $form = $('#style-form');
    $form.prepend('<a href="http://zo2framework.org" target="_blank" id="zo2logo" title="Zo2 Framework"></a>');
};

var fixToolbarIcon = function () {
    var $ = jQuery;
    $('.icon-apply').replaceWith('<i class="icon-check"></i>');
    $('.icon-save-copy').replaceWith('<i class="icon-copy"></i>');
    $('.icon-cancel').replaceWith('<i class="icon-remove-sign color4"></i>');
};

var wrapForm = function() {
    var $ = jQuery;
    var $form = $('#style-form');
    var $wrapper = $('<div id="zo2-config" />').insertBefore($form);
    $form.appendTo($wrapper);
};

var injectFormSubmit = function() {
    var $ = jQuery;
    var $input = $('.hfLayoutHtml');
    document.adminForm.onsubmit = function() {
        $input.val(generateJson());
        return false;
    };
};

var generateSlug = function(str) {
    str = str.replace(/^\s+|\s+$/g, '');
    var from = "ÁÀẠẢÃĂẮẰẶẲẴÂẤẦẬẨẪáàạảãăắằặẳẵâấầậẩẫóòọỏõÓÒỌỎÕôốồộổỗÔỐỒỘỔỖơớờợởỡƠỚỜỢỞỠéèẹẻẽÉÈẸẺẼêếềệểễÊẾỀỆỂỄúùụủũÚÙỤỦŨưứừựửữƯỨỪỰỬỮíìịỉĩÍÌỊỈĨýỳỵỷỹÝỲỴỶỸĐđÑñÇç·/_,:;";
    var to   = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaooooooooooooooooooooooooooooooooooeeeeeeeeeeeeeeeeeeeeeeuuuuuuuuuuuuuuuuuuuuuuiiiiiiiiiiyyyyyyyyyyddnncc------";

    for (var i = 0, l = from.length ; i < l; i++) {
        str = str.replace(new RegExp(from[i], "g"), to[i]);
    }
    str = str.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase();
    str = str.replace(/(-){2,}/i, '-');
    return str;
};