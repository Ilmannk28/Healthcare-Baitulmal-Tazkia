export function statusPage(requests, role) {
  return `
    <div class="table-responsive bg-white p-3 rounded shadow-sm">
      <table class="table table-hover">
        <thead class="table-dark">
          <tr>
            <th>ID</th><th>Layanan</th><th>User</th><th>Status</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${requests.map(r => `
            <tr>
              <td>REQ-${r.request_id}</td>
              <td>${r.service_name}</td>
              <td>${r.user_name}</td>
              <td>${r.status_name}</td>
              <td>
                ${role === 'admin' ? `
                  <button class="btn btn-sm btn-success btn-approve me-1"
                    data-id="${r.request_id}">Setuju</button>
                  <button class="btn btn-sm btn-danger btn-reject"
                    data-id="${r.request_id}">Tolak</button>
                ` : `
                  <button class="btn btn-sm btn-orange btn-edit-request"
                    data-id="${r.request_id}"
                    data-service="${r.service_name}">Detail / Edit</button>
                `}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}