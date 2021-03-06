// Generated by CoffeeScript 1.6.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.WidgetAdmin = (function() {
    WidgetAdmin.options_forms = {};

    WidgetAdmin.options = {};

    WidgetAdmin.prototype.widget_status_icon_toggle = {
      1: {
        "ico": "glyphicon glyphicon-chevron-up",
        "message": "Published",
        "prefix": "Unpublish"
      },
      2: {
        "ico": "glyphicon glyphicon-chevron-down",
        "messsage": "Unpublished",
        "prefix": "Publish"
      }
    };

    function WidgetAdmin(options) {
      this.setupWidgetDeleter = __bind(this.setupWidgetDeleter, this);
      this.setupWidgetStatusHandler = __bind(this.setupWidgetStatusHandler, this);
      this.setupWidgetForms = __bind(this.setupWidgetForms, this);
      this.setupAdmin = __bind(this.setupAdmin, this);
      var not_impl;
      this.options = options;
      not_impl = $('a.not-implemented');
      if (not_impl.length > 0) {
        not_impl.each(function(i) {});
      }
      $(".widget-edit-link").tooltip({
        placement: "right"
      });
      $(".widget-delete-link").tooltip({
        placement: "right"
      });
      $(".widget-publish-link").tooltip({
        placement: "right"
      });
      this.setupAdmin();
      this.setupWidgetForms();
      this.setupSortableWidgets();
      this.setupWidgetStatusHandler();
      this.setupWidgetDeleter();
      this;
    }

    WidgetAdmin.prototype.setupAdmin = function() {
      var _this = this;
      $(".widget_class select").bind("change", function(e) {
        var type;
        type = $(e.currentTarget).find("option:selected").attr("value");
        if (!(type in _this.options_forms)) {
          return $.getJSON('/widget/options/' + type, function(data) {
            if (data.valid) {
              _this.options_forms[type] = data.opts;
              $("#options-form-holder").html(data.opts);
              return data;
            }
          });
        } else {
          return $("#options-form-holder").html(_this.options_forms[type]);
        }
      });
      return this;
    };

    WidgetAdmin.prototype.setupWidgetForms = function() {
      var that;
      $("#widget-form").adminForm({
        preSubmit: this.preSubmit,
        resultParsed: this.resultParsed
      });
      $.each($('.widget-add-link'), function(i) {
        var link;
        link = $(this);
        return link.click(function() {
          var slot_field, slot_name;
          slot_field = $("#widget-form").find("input[name=widgetslot]").get(0);
          slot_name = link.parents(".widget-wrapper").attr("id");
          slot_field.value = slot_name;
          return $("#widget-form").modal();
        });
      });
      $("#edit-widget-form").adminForm({
        resultParsed: this.onEditData
      });
      that = this;
      $.each($('.widget-edit-link'), function(i) {
        var $link, target;
        $link = $(this);
        target = $(this)[0];
        return $link.click(function() {
          var widget_id, widget_title;
          widget_id = target.id.split("-")[1];
          widget_title = target.parentElement.parentElement.parentElement.id;
          that.onEditForm(target, widget_id, widget_title);
          return $("#edit-widget-form").modal();
        });
      });
      return this;
    };

    WidgetAdmin.prototype.setupWidgetStatusHandler = function() {
      var status_icons,
        _this = this;
      status_icons = this.widget_status_icon_toggle;
      $(".widget-publish-link").on("click", (function(e) {
        var callback, id_split, widget_id;
        id_split = e.currentTarget.id.split("-");
        widget_id = id_split[1];
        callback = function(data) {
          var icon, new_class, target, toggle;
          if (data.status === true) {
            icon = e.currentTarget.getElementsByTagName("div")[0];
            toggle = _this.widget_status_icon_toggle[data.published];
            new_class = toggle["ico"];
            icon.className = new_class;
            target = $(e.currentTarget);
            return setTimeout(function() {
              target.tooltip('destroy');
              return target.attr("title", toggle["prefix"] + " this " + target.data("metaname"));
            }, target.tooltip({
              placement: 'right'
            }), 100);
          }
        };
        _this.remoteCall(e.currentTarget, _this.options.status_url, {
          "id": widget_id
        }, callback);
        return e.preventDefault();
      }));
      return this;
    };

    WidgetAdmin.prototype.setupWidgetDeleter = function() {
      var _this = this;
      return $(".widget-delete-link").on("click", (function(e) {
        var callback, id_split, widget_id;
        id_split = e.currentTarget.id.split("-");
        widget_id = id_split[1];
        callback = function() {
          var widget_container;
          widget_container = $("#ordering_" + widget_id);
          return widget_container.fadeOut(500, function() {
            return widget_container.remove();
          });
        };
        _this.remoteCall(e.currentTarget, _this.options.delete_url, {
          "id": widget_id
        }, callback);
        return e.preventDefault();
      }));
    };

    WidgetAdmin.prototype.setupSortableWidgets = function() {
      var setPadding, stylesheet, updateOrdering;
      updateOrdering = function(event, ui) {
        var args, next;
        next = ui.item.next();
        next.css({
          '-moz-transition': 'none',
          '-webkit-transition': 'none',
          'transition': 'none'
        });
        setTimeout(next.css.bind(next, {
          '-moz-transition': 'border-top-width 0.1s ease-in',
          '-webkit-transition': 'border-top-width 0.1s ease-in',
          'transition': 'border-top-width 0.1s ease-in'
        }));
        args = {
          'ordering_from': $(this).sortable('toArray').toString(),
          'ordering_to': $(ui.item).parent().sortable('toArray').toString()
        };
        if (args['ordering_from'] !== args['ordering_to']) {
          args['moved_widget'] = $(ui.item).attr('id');
          args['moved_parent'] = $(ui.item).parent().parent().attr('id');
          if (args['moved_parent'] === 'widget-sortable') {
            delete args['moved_parent'];
          }
        } else {
          delete args['ordering_to'];
          delete args['widget_class_to'];
        }
        return $.post(window.__widget_ordering_url, args, function(data) {
          if (!data) {
            return alert("Error occured: " + data + "\nWidget ordering wasn't updated.");
          }
        });
      };
      stylesheet = $('style[name=impostor_size]')[0].sheet;
      rule = stylesheet.rules ? stylesheet.rules[0].style : stylesheet.cssRules[0].style;
      setPadding = function(atHeight) {
        return rule.cssText = 'border-top-width: ' + atHeight + 'px';
      };
      return $('.widget-sortable').sortable({
        handle: '.ordering',
        opacity: '.7',
        stop: updateOrdering,
        forcePlaceholderSize: true,
        dropOnEmpty: true,
        placeholder: 'placeholder',
        helper: 'clone',
        revert: 150
      }).sortable('option', 'connectWith', '.widget-sortable').bind('sortstart', function(event, ui) {
        return setPadding(ui.item.height());
      }).disableSelection();
    };

    WidgetAdmin.prototype.onEditForm = function(link, widget_id, widget_title) {
      var options, url, widget;
      widget = this;
      url = "/widget/edit/" + widget_id + "/";
      options = {
        url: url,
        success: function(data) {
          widget.onEditData(null, data, widget_title);
          return $("#edit-widget-form").get(0).setAttribute("action", url);
        }
      };
      $.ajax(options);
      return this;
    };

    WidgetAdmin.prototype.remoteCall = function(e, url, params, callback) {
      var options, widget;
      widget = this;
      options = {
        type: "POST",
        url: url,
        data: params,
        success: function(data) {
          return callback(data);
        }
      };
      if (callback) {
        options["success"] = function(data) {
          return callback(data);
        };
      }
      $.ajax(options);
      return this;
    };

    WidgetAdmin.prototype.onEditData = function(e, params, widget_title) {
      var js, optHolder, _i, _len, _ref;
      if (params.status === true) {
        location.reload();
      } else {
        optHolder = $("#edit-widget-form").find('fieldset#widget-options').find(".options");
        $("#editForm h3#title").text("Edit " + widget_title);
        switch (params.type) {
          case "ef":
            optHolder.empty();
            optHolder.prepend(params.data);
            if (params.extra_js) {
              _ref = params.extra_js;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                js = _ref[_i];
                eval(js);
              }
            }
            break;
          default:
            this;
        }
      }
      return this;
    };

    WidgetAdmin.prototype.preSubmit = function(e, form) {
      form.hide();
      $('#editable-loading').show();
      if (typeof tinyMCE !== "undefined") {
        return tinyMCE.triggerSave();
      }
    };

    WidgetAdmin.prototype.resultParsed = function(e, params) {
      var action, back, close, data, doer, form, listSet, optHolder, optSet, resetForm;
      if (params.status === true) {
        location.reload();
      } else {
        form = params.form;
        data = params.data.data;
        listSet = form.find('fieldset#widget-list');
        optSet = form.find('fieldset#widget-options');
        optHolder = form.find('fieldset#widget-options').find(".options");
        back = form.find("input[name=back]");
        close = form.find("input[name=close]");
        doer = form.find("input[name=do]");
        action = form.get(0).getAttribute("action");
        resetForm = function(form) {
          listSet = form.find('fieldset#widget-list');
          optSet = form.find('fieldset#widget-options');
          optHolder = form.find('fieldset#widget-options').find(".options");
          form.hide();
          listSet.show();
          optHolder.empty();
          optSet.hide();
          $("#editForm h3#title").text("Configure this Widget");
          form.get(0).setAttribute("action", action);
          back.hide();
          return doer.val("Choose");
        };
        switch (params.data.type) {
          case "fi":
            listSet.hide();
            doer.val("Save");
            optHolder.prepend(data);
            optSet.show();
            form.get(0).setAttribute("action", "/widget/create/");
            back.show();
            back.bind('click', function(event) {
              event.preventDefault();
              resetForm(form);
              return form.show();
            });
            close.bind('click', function(event) {
              return resetForm(form);
            });
            break;
          case "nf":
            break;
          default:
            $("#editForm h3#title").text("You are done! Click save");
            this;
        }
      }
      $('#editable-loading').hide();
      return form.show();
    };

    WidgetAdmin.prototype.wysihtml = function(id) {
      return $("#" + id).wysihtml5({
        "font-styles": true,
        "emphasis": true,
        "lists": true,
        "html": true
      });
    };

    WidgetAdmin.prototype.gloweditor = function(id) {
      var editor;
      return editor = new glow.widgets.Editor("#" + id, {
        theme: "dark"
      });
    };

    WidgetAdmin.prototype.doFormSave = function(event) {
      return console.log("Form Clicked");
    };

    return WidgetAdmin;

  })();

}).call(this);
