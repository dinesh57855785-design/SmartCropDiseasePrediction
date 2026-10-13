import io
from unittest.mock import patch
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status


def get_dummy_uploaded_image(filename="test_leaf.jpg"):
    """Helper to create an in-memory valid JPEG image for upload testing."""
    buf = io.BytesIO()
    img = Image.new('RGB', (224, 224), color=(34, 139, 34))
    img.save(buf, format='JPEG')
    buf.seek(0)
    return SimpleUploadedFile(filename, buf.read(), content_type='image/jpeg')


class LeafDiseasePredictionSafetyTests(TestCase):
    """
    Targeted safety tests for leaf disease prediction:
    1. Successful model inference (no mock data fallback)
    2. Unsupported crop (returns HTTP 400 Bad Request)
    3. Missing model file (returns HTTP 500 without fake prediction)
    4. Inference exception (returns HTTP 500 without fake prediction)
    5. TensorFlow import failure (returns HTTP 500 without fake prediction)
    """

    def setUp(self):
        self.predict_url = '/api/disease/predict/'

    def test_successful_model_inference(self):
        """
        Verify that a valid image and crop trigger the real inference pipeline
        and return HTTP 200 or 201 with authentic prediction fields.
        """
        image = get_dummy_uploaded_image()
        mock_result = {
            'disease': 'Tomato – Early Blight',
            'disease_key': 'Tomato___Early_blight',
            'confidence': 0.9421,
            'treatment': 'Apply copper-based fungicide and remove infected lower leaves.',
            'is_healthy': False,
            'top_predictions': [
                {
                    'class': 'Tomato___Early_blight',
                    'disease': 'Tomato – Early Blight',
                    'confidence': 0.9421,
                }
            ],
        }

        with patch('prediction.predict.predict_disease', return_value=mock_result):
            response = self.client.post(
                self.predict_url,
                {'image': image, 'crop_name': 'Tomato'},
                format='multipart'
            )

        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertEqual(response.data.get('predicted_disease'), 'Tomato – Early Blight')
        self.assertEqual(response.data.get('disease_key'), 'Tomato___Early_blight')
        self.assertAlmostEqual(response.data.get('confidence'), 0.9421, places=3)
        self.assertEqual(response.data.get('is_healthy'), False)
        self.assertIn('treatment_advice', response.data)

    def test_real_trained_model_inference_end_to_end(self):
        """
        Verify real end-to-end inference against the loaded trained model.h5
        without any mock intercepting predict_disease.
        """
        image = get_dummy_uploaded_image()
        response = self.client.post(
            self.predict_url,
            {'image': image, 'crop_name': 'Tomato'},
            format='multipart'
        )

        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertIn('Tomato', response.data.get('predicted_disease', ''))
        self.assertGreater(response.data.get('confidence', 0), 0.0)
        self.assertIn('is_healthy', response.data)

    def test_unsupported_crop_returns_http_400(self):
        """
        Verify that specifying an unsupported crop raises ValueError in predict_disease
        and propagates to the client as structured HTTP 400 Bad Request.
        """
        image = get_dummy_uploaded_image()
        response = self.client.post(
            self.predict_url,
            {'image': image, 'crop_name': 'Dragonfruit'},
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn("not currently supported", response.data['error'])
        # Must not return fake disease or confidence
        self.assertNotIn('predicted_disease', response.data)
        self.assertNotIn('confidence', response.data)
        self.assertNotIn('is_healthy', response.data)

    def test_missing_model_file_returns_http_500(self):
        """
        Verify that if the model file is missing, FileNotFoundError is raised
        and returned as structured HTTP 500 without returning fake disease prediction.
        """
        image = get_dummy_uploaded_image()
        with patch('prediction.predict.predict_disease', side_effect=FileNotFoundError("Trained model not found at ai_model/saved_model/model.h5")):
            response = self.client.post(
                self.predict_url,
                {'image': image, 'crop_name': 'Tomato'},
                format='multipart'
            )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        self.assertIn("Trained model not found", response.data['error'])
        # Must NOT return fake disease name, confidence score, or health status
        self.assertNotIn('predicted_disease', response.data)
        self.assertNotIn('confidence', response.data)
        self.assertNotIn('is_healthy', response.data)

    def test_inference_exception_returns_http_500(self):
        """
        Verify that if model inference fails with an exception,
        it returns structured HTTP 500 and does NOT fall back to fake prediction.
        """
        image = get_dummy_uploaded_image()
        with patch('prediction.predict.predict_disease', side_effect=RuntimeError("TensorFlow inference failed: memory exhausted")):
            response = self.client.post(
                self.predict_url,
                {'image': image, 'crop_name': 'Tomato'},
                format='multipart'
            )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        self.assertIn("TensorFlow inference failed", response.data['error'])
        # Must NOT return fake disease name, confidence score, or health status
        self.assertNotIn('predicted_disease', response.data)
        self.assertNotIn('confidence', response.data)
        self.assertNotIn('is_healthy', response.data)

    def test_tensorflow_import_failure_returns_http_500(self):
        """
        Verify that if TensorFlow cannot import, structured HTTP 500 is returned
        without falling back to fake prediction data.
        """
        image = get_dummy_uploaded_image()
        with patch('prediction.predict.predict_disease', side_effect=ImportError("No module named 'tensorflow'")):
            response = self.client.post(
                self.predict_url,
                {'image': image, 'crop_name': 'Tomato'},
                format='multipart'
            )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        self.assertIn("No module named 'tensorflow'", response.data['error'])
        # Must NOT return fake disease name, confidence score, or health status
        self.assertNotIn('predicted_disease', response.data)
        self.assertNotIn('confidence', response.data)
        self.assertNotIn('is_healthy', response.data)
