from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPageNumberPagination(PageNumberPagination):
    page_size_query_param = 'count'  # allow client-side page_size customization

    def get_paginated_response(self, data):
        return Response({
            'items': data,
            'page': self.page.number,
            'maxPage': self.page.paginator.num_pages,
            'totalCount': self.page.paginator.count,
        })
