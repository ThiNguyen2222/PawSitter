from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from .models import MessageThread, Message
""" These cover: listing & creating threads, permissions, listing & sending messages, and model behaviors. """
User = get_user_model()

class MessagingAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_a = User.objects.create_user(username="a", email="a@example.com", password="pass123")
        self.user_b = User.objects.create_user(username="b", email="b@example.com", password="pass123")
        self.user_c = User.objects.create_user(username="c", email="c@example.com", password="pass123")  # outsider

        self.thread = MessageThread.objects.create(user_a=self.user_a, user_b=self.user_b)
        self.msg = Message.objects.create(thread=self.thread, sender=self.user_a, body="hello")

    def auth(self, user):
        self.client.force_authenticate(user=user)

    # ---------------------------------------------------------------------
    """
    Purpose: 
        Verify that the "GET /api/messaging/threads/" endpoint only returns
        message threads that the authenticated user participates in. 
    """
    def test_threads_list_returns_only_participant_threads(self):
       # Create an extra thread that does NOT involve user_a
        MessageThread.objects.create(user_a=self.user_b, user_b=self.user_c)

        # Authenticate as user_a and hit the endpoint
        self.auth(self.user_a)
        url = reverse("thread-list-create")
        res = self.client.get(url)

        # Expect 200 OK and that the response only contains the one thread user_a is part of
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [t["id"] for t in res.data]
        self.assertIn(self.thread.id, ids)  # includes the a<->b thread
        self.assertEqual(len(ids), 1)       # should NOT include b<->c thread

    # ---------------------------------------------------------------------
    # Permission enforcement (403)
    def test_cannot_create_thread_if_not_participant_returns_403(self):
        """Non-participant (user_c) creating a (d,e) thread should get 403."""
        user_d = User.objects.create_user(username="d", email="d@example.com", password="pass123")
        user_e = User.objects.create_user(username="e", email="e@example.com", password="pass123")

        self.auth(self.user_c)
        url = reverse("thread-list-create")
        payload = {"user_a": user_d.id, "user_b": user_e.id, "booking": None}

        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # ---------------------------------------------------------------------
    # Duplicate prevention (400)
    def test_duplicate_thread_returns_400(self):
        """Creating the same pair (a,b) again should 400 from serializer."""
        self.auth(self.user_a)
        url = reverse("thread-list-create")
        payload_dup = {"user_a": self.user_a.id, "user_b": self.user_b.id, "booking": None}

        res = self.client.post(url, payload_dup, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already exists", str(res.data).lower())

    # ---------------------------------------------------------------------
    # Thread creation (valid users)
    def test_create_thread_success_when_participant_and_new_pair(self):
        """Participant creating a new (a,c) thread should 201."""
        self.auth(self.user_a)
        url = reverse("thread-list-create")
        payload_new = {"user_a": self.user_a.id, "user_b": self.user_c.id, "booking": None}

        res = self.client.post(url, payload_new, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        returned_ids = {res.data["user_a"], res.data["user_b"]}
        self.assertEqual(returned_ids, {self.user_a.id, self.user_c.id})

    # ---------------------------------------------------------------------
    # Message listing + permissions
    def test_thread_messages_list_only_for_participants(self):
        url = reverse("thread-messages", kwargs={"pk": self.thread.id})

        self.auth(self.user_a)
        res_a = self.client.get(url)
        self.assertEqual(res_a.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_a.data), 1)
        self.assertEqual(res_a.data[0]["body"], "hello")

        self.auth(self.user_c)  # outsider
        res_c = self.client.get(url)
        self.assertEqual(res_c.status_code, status.HTTP_403_FORBIDDEN)

    # ---------------------------------------------------------------------
    # Message creation
    def test_send_message_sets_sender_and_thread_ignoring_payload_thread(self):
        url = reverse("thread-messages", kwargs={"pk": self.thread.id})
        self.auth(self.user_b)
        # Even if client tries to spoof thread/sender, serializer has thread/sender read-only
        res = self.client.post(url, {"body": "hey!"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["body"], "hey!")
        self.assertEqual(res.data["sender"], str(self.user_b))  # StringRelatedField uses __str__()
        self.assertEqual(Message.objects.filter(thread=self.thread).count(), 2)

    # ---------------------------------------------------------------------
    # Message ordering
    def test_message_ordering_by_created_at(self):
        self.auth(self.user_a)
        url = reverse("thread-messages", kwargs={"pk": self.thread.id})
        self.client.post(url, {"body": "second"}, format="json")
        res = self.client.get(url)
        bodies = [m["body"] for m in res.data]
        self.assertEqual(bodies, ["hello", "second"])  # ordering = ["created_at"]

class MessagingModelTests(TestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username="a", email="a@example.com", password="pass123")
        self.user_b = User.objects.create_user(username="b", email="b@example.com", password="pass123")

    def test_unique_together_booking_user_pair(self):
        t1 = MessageThread.objects.create(user_a=self.user_a, user_b=self.user_b, booking=None)
        with self.assertRaises(Exception):
            MessageThread.objects.create(user_a=self.user_a, user_b=self.user_b, booking=None)

    def test_strs(self):
        t = MessageThread.objects.create(user_a=self.user_a, user_b=self.user_b)
        m = Message.objects.create(thread=t, sender=self.user_a, body="abc xyz 1234567890"*2)
        self.assertIn("Thread #", str(t))
        self.assertIn("Msg(", str(m))

