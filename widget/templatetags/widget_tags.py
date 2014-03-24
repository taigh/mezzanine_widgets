from classytags.core import Options, Tag
from classytags.helpers import InclusionTag
from classytags.arguments import Argument, KeywordArgument, MultiKeywordArgument

from django import template
from django.core.urlresolvers import reverse
from django.db.models.base import Model
from django.template.loader import get_template_from_string

from widget.models import Widget
from widget.utilities import can
from widget.widget_renderer import render_widgets_for_slot, make_or_get_widget_for_slot
from widget.forms import WidgetForm

register = template.Library()


class PlaceWidget(InclusionTag):
    template = "widget/single_holder.html"
    name = 'place_widget'
    options = Options(
        Argument('slot', required=True, resolve=False),
        MultiKeywordArgument('kwargs', required=True, resolve=False),
    )

    def get_context(self, context, slot, kwargs):
        page = context.get('page', None)

        context['slot'] = slot
        user = context['request'].user

        rendered = make_or_get_widget_for_slot(slot, context, **kwargs)
        if rendered:
            context['widget'] = rendered
            context['contains_widget'] = True
        else:
            context['contains_widget'] = False

        return context


register.tag(PlaceWidget)


class RenderWidgets(InclusionTag):
    template = "widget/holder.html"
    name = 'render_widgets'
    options = Options(
        Argument('slot', required=True, resolve=False),
    )

    def get_context(self, context, slot):
        page = context.get('page', None)

        if context.has_key("slot"):
            slot = "%s/%s" % (context["slot"], slot)

        context['slot'] = slot
        user = context['request'].user
        rendered = render_widgets_for_slot(slot, context)
        if rendered:
            context['widgets'] = rendered
            context['contains_widgets'] = True
        else:
            context['widgets'] = [{'widget': Widget()}]
            context['contains_widgets'] = False
            #add widget list form for adding new widgets
        form = WidgetForm(initial={"page": page,
                                   "user": user,
                                   "widgetslot": slot})
        context['widget_form'] = form

        return context


register.tag(RenderWidgets)


class add_widget(Tag):
    template = "widget/add_Widget.html"
    name = "add_widget"
    options = Options(
        KeywordArgument('page_less', required=False, resolve=False, default=False),
        Argument('model', required=True, resolve=True, default=None)
    )


class edit_widget(Tag):
    template = "widget/edit_widgets.html"
    name = 'render_widgets'
    options = Options(
        Argument('widget', required=True, resolve=True),
    )

    def get_context(self, widget):
        "create initial options"
        return '<a href="#" id="%s" rel="#edit-widget-form">Edit</a>' % (widget.id)


@register.inclusion_tag("widget/widget_loader.html", takes_context=True)
def widget_loader(context):
    """
    Set up the required JS/CSS for the in-line editing toolbar and controls.
    """
    try:
        page = context['page']
        user = context['request'].user
        context.update({"widget_form": WidgetForm(initial={"page": page, "user": user})})
    except Exception:
        pass
    return context
