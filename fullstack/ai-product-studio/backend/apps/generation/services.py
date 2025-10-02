from urllib.parse import quote


class ImageGenerationService:
    provider = "mock"

    def generate(self, job):
        seed = quote(str(job.id))
        style = quote(job.style)
        job.status = job.Status.COMPLETED
        job.provider = self.provider
        job.output_image_url = f"https://picsum.photos/seed/{seed}-{style}/1024/1024"
        job.provider_payload = {
            "mode": "mock",
            "message": "Replace this service with your model provider adapter.",
        }
        job.save(
            update_fields=[
                "status",
                "provider",
                "output_image_url",
                "provider_payload",
                "updated_at",
            ]
        )
        return job
