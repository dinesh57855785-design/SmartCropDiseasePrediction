from django.db import models


class Crop(models.Model):
    """Represents a type of crop that can be diagnosed."""
    name = models.CharField(max_length=100, unique=True)
    scientific_name = models.CharField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='crops/', blank=True, null=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
