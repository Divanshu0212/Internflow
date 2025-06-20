from django.urls import path
from .views import (
    UserProfileDetailView, EducationListView, EducationDetailView,
    SkillListView, SkillDetailView, CertificationListView,
    CertificationDetailView, ProjectListView, ProjectDetailView,
    CompleteProfileView,ProfilePictureUploadView,StudentProfileUpdateView,CompanyProfileUpdateView
)

urlpatterns = [
    path('profile/', UserProfileDetailView.as_view(), name='user-profile'),
    path('educations/', EducationListView.as_view(), name='education-list'),
    path('educations/<int:pk>/', EducationDetailView.as_view(), name='education-detail'),
    path('skills/', SkillListView.as_view(), name='skill-list'),
    path('skills/<int:pk>/', SkillDetailView.as_view(), name='skill-detail'),
    path('certifications/', CertificationListView.as_view(), name='certification-list'),
    path('certifications/<int:pk>/', CertificationDetailView.as_view(), name='certification-detail'),
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('profile-picture/', ProfilePictureUploadView.as_view(), name='profile-picture-upload'),
    path('complete-profile/', CompleteProfileView.as_view(), name='complete-profile'),
    path('student-profile/', StudentProfileUpdateView.as_view(), name='student-profile-update'),
    path('company-profile/', CompanyProfileUpdateView.as_view(), name='company-profile-update'),
    
]