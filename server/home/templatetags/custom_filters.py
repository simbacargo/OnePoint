# your_app/templatetags/custom_filters.py
from django import template

register = template.Library()

@register.filter(name='add_class')
def add_class(value, class_name):
    """
    Adds a class to the element's HTML tag
    Usage: {{ form.field|add_class:"your-class-name" }}
    """
    return value.as_widget(attrs={'class': class_name})
