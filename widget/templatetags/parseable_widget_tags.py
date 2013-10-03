import re

from django import template
from django.template.loader import render_to_string

from widget.forms import WidgetForm
from widget.widget_renderer import render_widgets_for_slot
from widget.models import Widget

register = template.Library()


@register.tag('parsewidgets')
def do_parse_with_widgets(parser, token):
    nodelist = parser.parse(('endparsewidgets',))
    parser.delete_first_token()
    return ParseableWidgetNode(nodelist)


class ParseableWidgetNode(template.Node):

    def __init__(self, nodelist):
        self.nodelist = nodelist

    def render(self, ctx):
        context = ctx.new(ctx)
        prerendered = self.nodelist.render(context)
        wtag = re.compile("{{((?:[a-z][a-z0-9_]*))}}")
        output = []
        lastPos = 0
        for m in wtag.finditer(prerendered):
            slot = m.group(1)
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
            form = WidgetForm(initial={"page": page,
                                       "user": user,
                                       "widgetslot": slot})
            context['widget_form'] = form
            rt = render_to_string("widget/holder.html",
                                  context_instance=context)
            output.append(prerendered[lastPos:m.start()])
            output.append(rt)
            lastPos = m.end()
        output.append(prerendered[lastPos:-1])
        output = "".join(output)
        return output
